import { useState, type FormEvent } from 'react'
import { ArrowUpRight, CalendarDays, CircleAlert, FileSearch, Gavel, LoaderCircle, Search } from 'lucide-react'
import { PageBanner } from '../components/PageBanner'
import { escavadorApi, type EscavadorProcesso } from '../api/escavador'
import { safeApiErrorMessage } from '../utils/safeApiErrorMessage'

function formatDate(value?: string) {
  if (!value) return 'Não informado'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date)
}

function ProcessResult({ process }: { process: EscavadorProcesso }) {
  const fontes = process.fontes ?? []
  const envolvidos = process.envolvidos ?? []
  const creditosUtilizados = process._integracao?.creditosUtilizadosCentavos
  return <section className="space-y-5" aria-label="Resultado da consulta">
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">Processo encontrado</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{process.numero_cnj || 'Número CNJ não informado'}</h2></div>
        {process.tribunal?.sigla && <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{process.tribunal.sigla}</span>}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500 dark:text-slate-400">Polo ativo</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{process.titulo_polo_ativo || 'Não informado'}</p></div>
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500 dark:text-slate-400">Polo passivo</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{process.titulo_polo_passivo || 'Não informado'}</p></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-2"><CalendarDays size={16} /> Início: {formatDate(process.data_inicio)}</span>
        <span className="inline-flex items-center gap-2"><Gavel size={16} /> Última movimentação: {formatDate(process.data_ultima_movimentacao)}</span>
        {typeof process.quantidade_movimentacoes === 'number' && <span>{process.quantidade_movimentacoes} movimentações</span>}
        {creditosUtilizados != null && <span>Custo informado pelo Escavador: {(Number(creditosUtilizados) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>}
      </div>
    </article>

    {fontes.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold text-slate-900 dark:text-white">Fontes e instâncias</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {fontes.map((fonte, index) => <article key={`${fonte.sigla ?? fonte.nome ?? 'fonte'}-${index}`} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900 dark:text-white">{fonte.nome || fonte.sigla || 'Tribunal'}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{[fonte.sigla, fonte.grau_formatado].filter(Boolean).join(' · ')}</p></div>{fonte.status_predito && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{fonte.status_predito}</span>}</div>
          {fonte.capa && <dl className="mt-3 space-y-2 text-sm"><div><dt className="text-xs text-slate-500 dark:text-slate-400">Classe</dt><dd className="text-slate-800 dark:text-slate-200">{fonte.capa.classe || 'Não informada'}</dd></div><div><dt className="text-xs text-slate-500 dark:text-slate-400">Assunto</dt><dd className="text-slate-800 dark:text-slate-200">{fonte.capa.assunto || 'Não informado'}</dd></div><div><dt className="text-xs text-slate-500 dark:text-slate-400">Situação</dt><dd className="text-slate-800 dark:text-slate-200">{fonte.capa.situacao || 'Não informada'}</dd></div>{fonte.capa.valor_causa?.valor_formatado && <div><dt className="text-xs text-slate-500 dark:text-slate-400">Valor da causa</dt><dd className="text-slate-800 dark:text-slate-200">{fonte.capa.valor_causa.valor_formatado}</dd></div>}</dl>}
        </article>)}
      </div>
    </section>}

    {envolvidos.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold text-slate-900 dark:text-white">Envolvidos</h3><ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">{envolvidos.map((envolvido, index) => <li key={`${envolvido.nome ?? 'envolvido'}-${index}`} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="font-medium text-slate-800 dark:text-slate-200">{envolvido.nome || 'Nome não informado'}</span><span className="text-slate-500 dark:text-slate-400">{[envolvido.tipo_normalizado, envolvido.polo].filter(Boolean).join(' · ')}</span></li>)}</ul>
    </section>}

    {process.processos_relacionados?.length ? <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h3 className="font-semibold text-slate-900 dark:text-white">Processos relacionados</h3><ul className="mt-3 flex flex-wrap gap-2">{process.processos_relacionados.map((related, index) => <li key={`${related.numero ?? 'processo'}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">{related.numero || 'Número indisponível'}</li>)}</ul></section> : null}
  </section>
}

export function ConsultaProcessualPage() {
  const [numero, setNumero] = useState('')
  const [processo, setProcesso] = useState<EscavadorProcesso | null>(null)
  const [erro, setErro] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function consultar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProcesso(null)
    setErro('')
    const numeroCnj = numero.replace(/\D/g, '')
    if (numeroCnj.length !== 20) {
      setErro('Informe o número CNJ completo, com 20 dígitos.')
      return
    }
    setIsLoading(true)
    try {
      setProcesso(await escavadorApi.consultarProcesso(numeroCnj))
    } catch (error) {
      setErro(safeApiErrorMessage(error, 'Não foi possível consultar o processo.'))
    } finally {
      setIsLoading(false)
    }
  }

  return <div className="kea-process-page"><div className="kea-process-content">
    <PageBanner section="Ecossistema" title="Consulta Processual" description="Consulte os dados de processos judiciais pela base do Escavador." />
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start gap-3"><span className="rounded-xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"><FileSearch size={21} /></span><div><h2 className="font-semibold text-slate-900 dark:text-white">Número do processo</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pesquise pelo número CNJ completo (20 dígitos). Exemplo: 0018063-19.2013.8.26.0002.</p></div></div>
      <form onSubmit={consultar} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <label className="min-w-0 flex-1"><span className="sr-only">Número CNJ</span><input value={numero} onChange={(event) => setNumero(event.target.value)} inputMode="numeric" autoComplete="off" placeholder="0000000-00.0000.0.00.0000" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm tracking-wide text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
        <button type="submit" disabled={isLoading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">{isLoading ? <><LoaderCircle size={17} className="animate-spin" /> Consultando…</> : <><Search size={17} /> Consultar</>}</button>
      </form>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">A consulta usa créditos da conta Escavador configurada no backend.</p>
    </section>
    {erro && <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"><CircleAlert size={18} className="mt-0.5 shrink-0" /><p>{erro}</p></div>}
    {processo && <div className="mt-5"><ProcessResult process={processo} /></div>}
    <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Os dados exibidos vêm da base indexada do Escavador e podem não refletir movimentações mais recentes. <a className="inline-flex items-center gap-1 font-semibold text-teal-700 underline dark:text-teal-300" href="https://api.escavador.com/v2/docs/consulta-de-processos" target="_blank" rel="noreferrer">Documentação da API <ArrowUpRight size={12} /></a></p>
  </div></div>
}
