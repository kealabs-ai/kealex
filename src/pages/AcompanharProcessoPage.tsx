import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, FileSearch, LoaderCircle, RefreshCw, Search } from 'lucide-react'
import { PageBanner } from '../components/PageBanner'
import { Modal } from '../components/Modal'
import { EmptyState, SkeletonRow } from '../components/Cards'
import { useToast } from '../components/Toast'
import { processosAcompanhadosApi, type ProcessoAcompanhado } from '../api/processosAcompanhados'

const PAGE_SIZE = 20
const KEY = ['processos-acompanhados']

interface Movimento { data?: string; nome?: string; tipo?: string; complementos?: string; descricao?: string; fonte?: string }
interface Envolvido { nome?: string; polo?: string; tipo_normalizado?: string; advogados?: Array<{ nome?: string }> }
interface Fonte {
  nome?: string; sigla?: string; grau_formatado?: string
  capa?: { classe?: string; assunto?: string; orgao_julgador?: string; comarca?: string; vara?: string; data_distribuicao?: string; valor_causa?: { valor_formatado?: string } }
  movimentacoes?: Movimento[]
}
interface DetalheProcesso { fontes?: Fonte[]; envolvidos?: Envolvido[]; data_inicio?: string }

function mensagemErro(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback
  const response = (error as { response?: { data?: { detail?: unknown } } }).response
  const detail = response?.data?.detail
  if (typeof detail === 'string') return detail
  if (typeof detail === 'object' && detail !== null && 'message' in detail && typeof detail.message === 'string') return detail.message
  return fallback
}

function FilterSelect({ value, label, options, onChange }: { value: string; label: string; options: string[]; onChange: (value: string) => void }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">{label}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
}

function somenteDigitos(value: string) { return value.replace(/\D/g, '').slice(0, 20) }

function formatarCnj(value: string) {
  const digits = somenteDigitos(value)
  let result = digits.slice(0, 7)
  if (digits.length > 7) result += `-${digits.slice(7, 9)}`
  if (digits.length > 9) result += `.${digits.slice(9, 13)}`
  if (digits.length > 13) result += `.${digits.slice(13, 14)}`
  if (digits.length > 14) result += `.${digits.slice(14, 16)}`
  if (digits.length > 16) result += `.${digits.slice(16, 20)}`
  return result
}

function cnjValido(value: string) {
  const n = somenteDigitos(value)
  if (n.length !== 20) return false
  const calculo = `${n.slice(0, 7)}${n.slice(9)}00`
  return 98n - (BigInt(calculo) % 97n) === BigInt(n.slice(7, 9))
}

function data(value?: string | null) {
  if (!value) return 'Não informada'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

function texto(value: unknown, fallback = 'Não informado'): string {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number') return String(value)
  return fallback
}

function Detalhes({ processo, fechar }: { processo: ProcessoAcompanhado; fechar: () => void }) {
  const { data: historico = [] } = useQuery({ queryKey: [...KEY, processo.id, 'historico'], queryFn: () => processosAcompanhadosApi.historico(processo.id) })
  const raw = processo.dados as DetalheProcesso
  const fontes = Array.isArray(raw.fontes) ? raw.fontes : []
  const movimentos: Movimento[] = fontes.flatMap((fonte) => (fonte.movimentacoes ?? []).map((movimento) => ({ ...movimento, fonte: fonte.nome ?? fonte.sigla })))
    .sort((a, b) => String(b.data ?? '').localeCompare(String(a.data ?? '')))
  const envolvidos = Array.isArray(raw.envolvidos) ? raw.envolvidos : []
  return <Modal title={processo.numero_processo} subtitle="Detalhes do processo acompanhado" onClose={fechar} size="lg">
    <div className="max-h-[72vh] space-y-5 overflow-y-auto pr-1">
      <section><h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Informações gerais</h3><dl className="grid gap-3 sm:grid-cols-2">{[
        ['Tribunal', processo.tribunal], ['Órgão julgador', fontes[0]?.capa?.orgao_julgador], ['Comarca', fontes[0]?.capa?.comarca], ['Vara', fontes[0]?.capa?.vara], ['Classe processual', processo.classe_processual], ['Assunto', processo.assunto], ['Distribuição', fontes[0]?.capa?.data_distribuicao ?? raw.data_inicio], ['Valor da causa', fontes[0]?.capa?.valor_causa?.valor_formatado], ['Situação', processo.situacao], ['Grau', fontes[0]?.grau_formatado], ['Fase processual', processo.fase_atual ?? 'Não identificada'], ['Última consulta', data(processo.ultima_consulta_em)],
      ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{texto(value)}</dd></div>)}</dl></section>
      <section><h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Partes e representantes</h3>{envolvidos.length ? <ul className="divide-y divide-slate-100 dark:divide-slate-700">{envolvidos.map((item, index) => <li key={`${item.nome}-${index}`} className="py-2 text-sm"><strong>{texto(item.nome)}</strong><span className="ml-2 text-slate-500">{[item.polo, item.tipo_normalizado].filter(Boolean).join(' · ')}</span>{item.advogados?.map((adv, i) => <p key={i} className="mt-1 text-xs text-slate-500">Representante: {texto(adv.nome)}</p>)}</li>)}</ul> : <p className="text-sm text-slate-500">Dados de partes indisponíveis pela fonte.</p>}</section>
      <section><h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Movimentações processuais</h3>{movimentos.length ? <ol className="space-y-3">{movimentos.map((item, index) => <li key={`${item.data}-${index}`} className="border-l-2 border-teal-500 pl-3"><p className="text-xs text-slate-500">{data(item.data)} · {texto(item.fonte)}</p><p className="text-sm font-medium text-slate-800 dark:text-slate-200">{texto(item.nome ?? item.tipo)}</p><p className="text-sm text-slate-600 dark:text-slate-400">{texto(item.complementos ?? item.descricao)}</p></li>)}</ol> : <p className="text-sm text-slate-500">A fonte não retornou movimentações detalhadas.</p>}</section>
      <section><h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Histórico de atualizações</h3>{historico.length ? <ul className="space-y-2">{historico.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900"><span>{data(item.consultado_em)} · {item.fornecedor}</span><span className="text-slate-500">{item.status_consulta}{item.houve_alteracao ? ' · Houve alterações' : ''}</span></li>)}</ul> : <p className="text-sm text-slate-500">Nenhuma atualização registrada.</p>}</section>
    </div>
  </Modal>
}

export function AcompanharProcessoPage() {
  const [numero, setNumero] = useState('')
  const [search, setSearch] = useState('')
  const [tribunal, setTribunal] = useState('')
  const [fase, setFase] = useState('')
  const [situacao, setSituacao] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<ProcessoAcompanhado | null>(null)
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(() => new Set())
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const list = useQuery({ queryKey: [...KEY, page, search, tribunal, fase, situacao], queryFn: () => processosAcompanhadosApi.list({ page, page_size: PAGE_SIZE, search, tribunal: tribunal || undefined, fase: fase || undefined, situacao: situacao || undefined }) })
  const consulta = useMutation({ mutationFn: processosAcompanhadosApi.consultar, onSuccess: async () => { setNumero(''); await queryClient.invalidateQueries({ queryKey: KEY }); success('Processo consultado e salvo com sucesso.') }, onError: (e: unknown) => error(mensagemErro(e, 'Não foi possível consultar o processo.')) })
  const atualizar = useMutation({ mutationFn: processosAcompanhadosApi.atualizar, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: KEY }); success('Processo atualizado com sucesso.') }, onError: (e: unknown) => error(mensagemErro(e, 'Não foi possível atualizar o processo.')) })
  const items = useMemo(() => list.data?.items ?? [], [list.data?.items])
  const totalPages = Math.max(1, Math.ceil((list.data?.total ?? 0) / PAGE_SIZE))
  const filters = list.data?.filters ?? { tribunais: [], fases: [], situacoes: [] }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!cnjValido(numero)) { error('Informe um número CNJ válido com 20 dígitos.'); return }
    consulta.mutate(somenteDigitos(numero))
  }

  const filterChange = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1) }
  async function atualizarProcesso(id: string) {
    if (updatingIds.has(id)) return
    setUpdatingIds((current) => new Set(current).add(id))
    try { await atualizar.mutateAsync(id) } finally { setUpdatingIds((current) => { const next = new Set(current); next.delete(id); return next }) }
  }
  return <div className="kea-process-page"><div className="kea-process-content">
    <PageBanner section="Ecossistema" title="Acompanhar Processo" description="Consulte, acompanhe e mantenha atualizadas as informações dos seus processos judiciais em um único ambiente." />
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start gap-3"><span className="rounded-xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"><FileSearch size={21} /></span><div><h2 className="font-semibold text-slate-900 dark:text-white">Consultar processo</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A consulta é feita pelo backend usando a integração processual configurada.</p></div></div>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row"><label className="min-w-0 flex-1"><span className="sr-only">Número do Processo</span><input value={numero} onChange={(e) => setNumero(formatarCnj(e.target.value))} inputMode="numeric" autoComplete="off" placeholder="0000000-00.0000.0.00.0000" aria-label="Número do Processo" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm tracking-wide text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label><button type="submit" disabled={consulta.isPending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">{consulta.isPending ? <><LoaderCircle size={17} className="animate-spin" /> Consultando…</> : <><Search size={17} /> Consultar Processo</>}</button></form>
    </section>
    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800"><div><h2 className="font-semibold text-slate-900 dark:text-white">Processos acompanhados</h2><p className="mt-1 text-sm text-slate-500">{list.data?.total ?? 0} registros</p></div><label className="relative min-w-52 flex-1 sm:max-w-xs"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Buscar número CNJ" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label></div>
      <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-3 dark:border-slate-800"><FilterSelect value={tribunal} onChange={filterChange(setTribunal)} label="Todos os tribunais" options={filters.tribunais} /><FilterSelect value={fase} onChange={filterChange(setFase)} label="Todas as fases" options={filters.fases} /><FilterSelect value={situacao} onChange={filterChange(setSituacao)} label="Todas as situações" options={filters.situacoes} /></div>
      <div className="overflow-x-auto">{list.isError ? <p role="alert" className="p-8 text-center text-sm text-rose-700">Não foi possível carregar os processos acompanhados.</p> : list.isLoading ? <div className="p-4">{[0, 1, 2].map((n) => <SkeletonRow key={n} variant="list" />)}</div> : items.length === 0 ? <div className="p-8"><EmptyState message="Nenhum processo acompanhado encontrado" icon={<FileSearch size={28} className="text-slate-300" />} /></div> : <table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950"><tr>{['Número do Processo', 'Tribunal', 'Classe Processual', 'Assunto', 'Fase Atual', 'Situação', 'Última Movimentação', 'Última Atualização', 'Ações'].map((x) => <th key={x} className="px-4 py-3 font-semibold">{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{items.map((p) => <tr key={p.id} className="text-slate-700 dark:text-slate-300"><td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{p.numero_processo}</td><td className="px-4 py-3">{texto(p.tribunal)}</td><td className="px-4 py-3">{texto(p.classe_processual)}</td><td className="px-4 py-3">{texto(p.assunto)}</td><td className="px-4 py-3">{texto(p.fase_atual, 'Não identificada')}</td><td className="px-4 py-3">{texto(p.situacao)}</td><td className="whitespace-nowrap px-4 py-3">{data(p.data_ultima_movimentacao)}</td><td className="whitespace-nowrap px-4 py-3">{data(p.ultima_consulta_em)}</td><td className="px-4 py-3"><div className="flex items-center gap-1"><button type="button" onClick={() => setSelected(p)} aria-label={`Visualizar ${p.numero_processo}`} title="Visualizar detalhes" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-700 dark:hover:bg-slate-800"><Eye size={17} /></button><button type="button" onClick={() => atualizarProcesso(p.id)} disabled={updatingIds.has(p.id)} aria-label={`Atualizar ${p.numero_processo}`} title="Atualizar processo" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-teal-700 disabled:opacity-50 dark:hover:bg-slate-800"><RefreshCw size={16} className={updatingIds.has(p.id) ? 'animate-spin' : ''} /></button></div></td></tr>)}</tbody></table>}</div>
      <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm dark:border-slate-800"><span className="text-slate-500">Página {page} de {totalPages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((v) => v - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Anterior</button><button type="button" disabled={page >= totalPages} onClick={() => setPage((v) => v + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Próxima</button></div></footer>
    </section>
    {selected && <Detalhes processo={selected} fechar={() => setSelected(null)} />}
  </div></div>
}
