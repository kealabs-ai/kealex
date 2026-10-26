import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, CircleAlert, ExternalLink, Gavel, Landmark, LoaderCircle, Search, ShieldCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import { usuariosApi } from '../api/usuarios'

const tribunaisSuperiores = [
  { alias: 'stj', sigla: 'STJ', nome: 'Superior Tribunal de Justiça' },
  { alias: 'tst', sigla: 'TST', nome: 'Tribunal Superior do Trabalho' },
  { alias: 'tse', sigla: 'TSE', nome: 'Tribunal Superior Eleitoral' },
  { alias: 'stm', sigla: 'STM', nome: 'Superior Tribunal Militar' },
] as const

const tribunaisFederais = Array.from({ length: 6 }, (_, index) => {
  const regiao = index + 1
  return { alias: `trf${regiao}`, sigla: `TRF${regiao}`, nome: `Tribunal Regional Federal da ${regiao}ª Região` }
})

const tribunaisTrabalho = Array.from({ length: 24 }, (_, index) => {
  const regiao = index + 1
  return { alias: `trt${regiao}`, sigla: `TRT${regiao}`, nome: `Tribunal Regional do Trabalho da ${regiao}ª Região` }
})

const tribunaisEleitorais = [
  ['ac', 'Acre'], ['al', 'Alagoas'], ['am', 'Amazonas'], ['ap', 'Amapá'], ['ba', 'Bahia'],
  ['ce', 'Ceará'], ['dft', 'Distrito Federal e Territórios'], ['es', 'Espírito Santo'], ['go', 'Goiás'],
  ['ma', 'Maranhão'], ['mg', 'Minas Gerais'], ['ms', 'Mato Grosso do Sul'], ['mt', 'Mato Grosso'],
  ['pa', 'Pará'], ['pb', 'Paraíba'], ['pe', 'Pernambuco'], ['pi', 'Piauí'], ['pr', 'Paraná'],
  ['rj', 'Rio de Janeiro'], ['rn', 'Rio Grande do Norte'], ['ro', 'Rondônia'], ['rr', 'Roraima'],
  ['rs', 'Rio Grande do Sul'], ['sc', 'Santa Catarina'], ['se', 'Sergipe'], ['sp', 'São Paulo'],
  ['to', 'Tocantins'],
].map(([uf, nome]) => ({ alias: `tre-${uf}`, sigla: `TRE-${uf.toUpperCase()}`, nome: `Tribunal Regional Eleitoral de ${nome}` }))

const tribunaisMilitares = [
  { alias: 'tjmmg', sigla: 'TJMMG', nome: 'Tribunal de Justiça Militar de Minas Gerais' },
  { alias: 'tjmrs', sigla: 'TJMRS', nome: 'Tribunal de Justiça Militar do Rio Grande do Sul' },
  { alias: 'tjmsp', sigla: 'TJMSP', nome: 'Tribunal de Justiça Militar de São Paulo' },
]

const tribunaisEstaduais = [
  { alias: 'tjac', sigla: 'TJAC', nome: 'Tribunal de Justiça do Acre' },
  { alias: 'tjal', sigla: 'TJAL', nome: 'Tribunal de Justiça de Alagoas' },
  { alias: 'tjam', sigla: 'TJAM', nome: 'Tribunal de Justiça do Amazonas' },
  { alias: 'tjap', sigla: 'TJAP', nome: 'Tribunal de Justiça do Amapá' },
  { alias: 'tjba', sigla: 'TJBA', nome: 'Tribunal de Justiça da Bahia' },
  { alias: 'tjce', sigla: 'TJCE', nome: 'Tribunal de Justiça do Ceará' },
  { alias: 'tjdft', sigla: 'TJDFT', nome: 'Tribunal de Justiça do Distrito Federal e Territórios' },
  { alias: 'tjes', sigla: 'TJES', nome: 'Tribunal de Justiça do Espírito Santo' },
  { alias: 'tjgo', sigla: 'TJGO', nome: 'Tribunal de Justiça de Goiás' },
  { alias: 'tjma', sigla: 'TJMA', nome: 'Tribunal de Justiça do Maranhão' },
  { alias: 'tjmg', sigla: 'TJMG', nome: 'Tribunal de Justiça de Minas Gerais' },
  { alias: 'tjms', sigla: 'TJMS', nome: 'Tribunal de Justiça de Mato Grosso do Sul' },
  { alias: 'tjmt', sigla: 'TJMT', nome: 'Tribunal de Justiça de Mato Grosso' },
  { alias: 'tjpa', sigla: 'TJPA', nome: 'Tribunal de Justiça do Pará' },
  { alias: 'tjpb', sigla: 'TJPB', nome: 'Tribunal de Justiça da Paraíba' },
  { alias: 'tjpe', sigla: 'TJPE', nome: 'Tribunal de Justiça de Pernambuco' },
  { alias: 'tjpi', sigla: 'TJPI', nome: 'Tribunal de Justiça do Piauí' },
  { alias: 'tjpr', sigla: 'TJPR', nome: 'Tribunal de Justiça do Paraná' },
  { alias: 'tjrj', sigla: 'TJRJ', nome: 'Tribunal de Justiça do Rio de Janeiro' },
  { alias: 'tjrn', sigla: 'TJRN', nome: 'Tribunal de Justiça do Rio Grande do Norte' },
  { alias: 'tjro', sigla: 'TJRO', nome: 'Tribunal de Justiça de Rondônia' },
  { alias: 'tjrr', sigla: 'TJRR', nome: 'Tribunal de Justiça de Roraima' },
  { alias: 'tjrs', sigla: 'TJRS', nome: 'Tribunal de Justiça do Rio Grande do Sul' },
  { alias: 'tjsc', sigla: 'TJSC', nome: 'Tribunal de Justiça de Santa Catarina' },
  { alias: 'tjse', sigla: 'TJSE', nome: 'Tribunal de Justiça de Sergipe' },
  { alias: 'tjsp', sigla: 'TJSP', nome: 'Tribunal de Justiça de São Paulo' },
  { alias: 'tjto', sigla: 'TJTO', nome: 'Tribunal de Justiça do Tocantins' },
] as const

type ConsultaRamo = 'superiores' | 'estadual' | 'federal' | 'trabalho' | 'eleitoral' | 'militar'

type DatajudMovement = {
  codigo?: number
  nome?: string
  dataHora?: string
  complementosTabelados?: Array<{ nome?: string; valor?: number | string; descricao?: string }>
  complementos?: string[]
}

type DatajudProcess = {
  numeroProcesso?: string
  tribunal?: string
  grau?: string
  dataAjuizamento?: string
  dataHoraUltimaAtualizacao?: string
  classe?: { nome?: string; codigo?: number }
  sistema?: { nome?: string }
  orgaoJulgador?: { nome?: string }
  assuntos?: Array<{ nome?: string }>
  movimentos?: DatajudMovement[]
}

type DatajudSearchResponse = {
  hits?: {
    total?: { value?: number }
    hits?: Array<{ _source?: DatajudProcess }>
  }
}

function formatProcessNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 20)
  if (digits.length <= 7) return digits
  if (digits.length <= 9) return `${digits.slice(0, 7)}-${digits.slice(7)}`
  if (digits.length <= 13) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9)}`
  if (digits.length <= 14) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13)}`
  if (digits.length <= 16) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14)}`
  return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16)}`
}

function formatDate(value?: string, includeTime = false) {
  if (!value) return 'Não informado'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR', includeTime
    ? { dateStyle: 'long', timeStyle: 'short' }
    : { dateStyle: 'long' },
  ).format(date)
}

export function ConsultaTribunaisSuperioresPage() {
  return <ConsultaDataJudPage ramo="superiores" />
}

export function ConsultaJusticaEstadualPage() {
  return <ConsultaDataJudPage ramo="estadual" />
}

export function ConsultaJusticaFederalPage() {
  return <ConsultaDataJudPage ramo="federal" />
}

export function ConsultaJusticaTrabalhoPage() {
  return <ConsultaDataJudPage ramo="trabalho" />
}

export function ConsultaJusticaEleitoralPage() {
  return <ConsultaDataJudPage ramo="eleitoral" />
}

export function ConsultaJusticaMilitarPage() {
  return <ConsultaDataJudPage ramo="militar" />
}

function ConsultaDataJudPage({ ramo }: { ramo: ConsultaRamo }) {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [numeroProcesso, setNumeroProcesso] = useState(searchParams.get('numero') ?? '')
  const config = {
    superiores: { options: tribunaisSuperiores, orgao: 'Tribunais Superiores', title: 'Tribunais Superiores', initial: 'stj', description: 'Pesquise pelo número CNJ em um dos tribunais superiores disponíveis na API Pública do DataJud.' },
    estadual: { options: tribunaisEstaduais, orgao: 'Justiça Estadual', title: 'Justiça Estadual', initial: 'tjac', description: 'Pesquise pelo número CNJ em um dos tribunais estaduais disponíveis na API Pública do DataJud.' },
    federal: { options: tribunaisFederais, orgao: 'Justiça Federal', title: 'Justiça Federal', initial: 'trf1', description: 'Pesquise pelo número CNJ em um dos Tribunais Regionais Federais disponíveis na API Pública do DataJud.' },
    trabalho: { options: tribunaisTrabalho, orgao: 'Justiça do Trabalho', title: 'Justiça do Trabalho', initial: 'trt1', description: 'Pesquise pelo número CNJ em um dos Tribunais Regionais do Trabalho disponíveis na API Pública do DataJud.' },
    eleitoral: { options: tribunaisEleitorais, orgao: 'Justiça Eleitoral', title: 'Justiça Eleitoral', initial: 'tre-ac', description: 'Pesquise pelo número CNJ em um dos Tribunais Regionais Eleitorais disponíveis na API Pública do DataJud.' },
    militar: { options: tribunaisMilitares, orgao: 'Justiça Militar', title: 'Justiça Militar', initial: 'tjmmg', description: 'Pesquise pelo número CNJ nos tribunais militares estaduais disponíveis na API Pública do DataJud.' },
  }[ramo]
  const tribunalOptions = config.options
  const chaveOrgao = config.orgao
  const pageTitle = config.title
  const tribunalInicial = searchParams.get('tribunal')
  const [tribunal, setTribunal] = useState(tribunalOptions.some((item) => item.alias === tribunalInicial) ? tribunalInicial! : config.initial)
  const [processo, setProcesso] = useState<DatajudProcess | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchedNumber, setSearchedNumber] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const { data: publicKeys = [], isLoading: loadingKey } = useQuery({
    queryKey: ['public-keys', user?.id],
    queryFn: usuariosApi.listarChavesPublicas,
    enabled: Boolean(user),
  })

  const publicKey = publicKeys.find((item) => item.orgao.trim().toLocaleLowerCase('pt-BR') === chaveOrgao.toLocaleLowerCase('pt-BR'))?.chavePublica
  const selectedTribunal = tribunalOptions.find((item) => item.alias === tribunal) ?? tribunalOptions[0]
  const movements = [...(processo?.movimentos ?? [])].sort((a, b) => {
    const dateA = a.dataHora ? new Date(a.dataHora).getTime() : 0
    const dateB = b.dataHora ? new Date(b.dataHora).getTime() : 0
    return dateA - dateB
  })

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProcesso(null)
    setErrorMessage('')

    const digits = numeroProcesso.replace(/\D/g, '')
    if (digits.length !== 20) {
      setErrorMessage('Informe o número CNJ completo, com 20 dígitos.')
      return
    }
    if (!publicKey?.trim()) {
      setErrorMessage(`Cadastre sua chave pública do DataJud para ${chaveOrgao} na página Perfil antes de consultar.`)
      return
    }

    setIsSearching(true)
    setSearchedNumber(digits)
    try {
      const result = await usuariosApi.consultarProcessoDataJud({
        tribunal: selectedTribunal.alias,
        numeroProcesso: digits,
      }) as DatajudSearchResponse
      const hit = result.hits?.hits?.[0]?._source
      if (!hit) {
        setErrorMessage('Nenhum processo público foi localizado nesse tribunal com o número informado.')
        return
      }
      setProcesso(hit)
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErrorMessage(detail ?? (error instanceof Error ? error.message : 'Não foi possível consultar o DataJud agora.'))
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <TopBar icon={Landmark} title={pageTitle} subtitle="Consulta processual integrada ao DataJud · CNJ" />
      <main className="flex-1 overflow-y-auto p-5 sm:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Link to="/integracao-orgaos" className="inline-flex items-center gap-2 text-sm font-semibold text-[#087E96] transition hover:text-[#065F73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087E96]/40">
            <ArrowLeft size={16} /> Voltar para Integração com Órgãos
          </Link>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#087E96]/10 text-[#087E96] dark:bg-[#20B987]/15 dark:text-[#20B987]"><Search size={20} /></span>
              <div>
                <h2 className="text-lg font-bold text-[#102B46] dark:text-white">Consultar processo</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{config.description}</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.85fr)_auto] lg:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Número do processo (CNJ)</span>
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  value={numeroProcesso}
                  onChange={(event) => setNumeroProcesso(formatProcessNumber(event.target.value))}
                  placeholder="0000000-00.0000.0.00.0000"
                  aria-label="Número do processo no padrão CNJ"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium tracking-wide text-slate-900 outline-none transition focus:border-[#087E96] focus:ring-4 focus:ring-[#087E96]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Tribunal</span>
                <select value={tribunal} onChange={(event) => setTribunal(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#087E96] focus:ring-4 focus:ring-[#087E96]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                  {tribunalOptions.map((item) => <option key={item.alias} value={item.alias}>{item.sigla} · {item.nome}</option>)}
                </select>
              </label>
              <button type="submit" disabled={isSearching || loadingKey} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#102B46] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B2035] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/25 disabled:cursor-not-allowed disabled:opacity-60">
                {isSearching ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />}
                {isSearching ? 'Consultando…' : 'Consultar processo'}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck size={14} className="text-[#087E96] dark:text-[#20B987]" />
              {loadingKey ? 'Verificando chave pública cadastrada…' : publicKey ? 'Usando a chave pública do DataJud cadastrada no seu perfil.' : <>Nenhuma chave configurada. <Link to="/perfil" className="font-semibold text-[#087E96] underline underline-offset-2">Cadastrar chave no perfil</Link></>}
              <span className="inline-flex items-center gap-1 lg:ml-auto">Dados públicos do CNJ <a href="https://datajud-wiki.cnj.jus.br/api-publica/termo-uso/" target="_blank" rel="noreferrer" aria-label="Abrir termo de uso do DataJud em nova aba" className="font-semibold text-[#087E96] underline underline-offset-2">Termo de uso <ExternalLink size={12} /></a></span>
            </div>
          </section>

          {errorMessage && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <CircleAlert size={18} className="mt-0.5 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          {processo && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#087E96]/10 text-[#087E96] dark:bg-[#20B987]/15 dark:text-[#20B987]"><Gavel size={20} /></span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#087E96] dark:text-[#20B987]">{processo.tribunal ?? selectedTribunal.sigla} · {processo.grau ?? 'Grau não informado'}</p>
                      <h2 className="mt-1 break-all font-mono text-lg font-bold text-[#102B46] dark:text-white sm:text-xl">{formatProcessNumber(processo.numeroProcesso ?? searchedNumber)}</h2>
                      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{processo.classe?.nome ?? 'Classe processual não informada'}</p>
                    </div>
                  </div>
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><ShieldCheck size={14} /> Processo público</span>
                </div>

                <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
                  <InfoItem label="Órgão julgador" value={processo.orgaoJulgador?.nome ?? 'Não informado'} />
                  <InfoItem label="Distribuição" value={formatDate(processo.dataAjuizamento)} />
                  <InfoItem label="Sistema" value={processo.sistema?.nome ?? 'Não informado'} />
                  <InfoItem label="Assunto" value={processo.assuntos?.map((item) => item.nome).filter(Boolean).join(', ') || 'Não informado'} />
                </dl>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7">
                <div className="mb-6 flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#F96313]/10 text-[#F96313]"><CalendarDays size={20} /></span>
                  <div>
                    <h2 className="text-lg font-bold text-[#102B46] dark:text-white">Andamentos do processo</h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Movimentações disponibilizadas pelo {processo.tribunal ?? selectedTribunal.sigla} no DataJud.</p>
                  </div>
                </div>
                {movements.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">O DataJud não retornou movimentações para este processo.</p>
                ) : (
                  <ol className="relative ml-2 border-l-2 border-[#087E96]/20 pl-6 dark:border-[#20B987]/20">
                    {movements.map((movement, index) => {
                      const isLatest = index === movements.length - 1
                      const complements = [
                        ...(movement.complementos ?? []),
                        ...(movement.complementosTabelados ?? []).map((item) => [item.nome, item.valor, item.descricao].filter(Boolean).join(' · ')),
                      ].filter(Boolean)
                      return (
                        <li key={`${movement.codigo ?? 'mov'}-${movement.dataHora ?? index}-${index}`} className="relative pb-7 last:pb-0">
                          <span className={`absolute -left-[calc(1.5rem+5px)] top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${isLatest ? 'bg-[#F96313] ring-4 ring-[#F96313]/15' : 'bg-[#087E96] dark:bg-[#20B987]'}`} />
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                            <h3 className={`text-sm font-semibold ${isLatest ? 'text-[#102B46] dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{movement.nome ?? 'Movimentação processual'}</h3>
                            <time className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(movement.dataHora, true)}</time>
                          </div>
                          {complements.length > 0 && <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{complements.map((item, itemIndex) => <li key={`${itemIndex}-${item}`}>{item}</li>)}</ul>}
                        </li>
                      )
                    })}
                  </ol>
                )}
                {processo.dataHoraUltimaAtualizacao && <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">Dados atualizados em {formatDate(processo.dataHoraUltimaAtualizacao, true)} · Fonte: DataJud/CNJ.</p>}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  )
}
