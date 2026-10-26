import { useState, type FormEvent } from 'react'
import { ArrowRight, Building2, CircleAlert, Gavel, Landmark, MapPin, Search, Scale, Shield, Vote } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Topbar } from '../components/TopBar'
import { PageBanner } from '../components/PageBanner'

const areas = [
  {
    title: 'Tribunais Superiores',
    description: 'Consultas nos tribunais responsáveis por uniformizar a interpretação das leis e da Constituição.',
    institutions: ['STJ', 'TST', 'TSE', 'STM'],
    icon: Landmark,
    accent: 'text-violet-600 bg-violet-50 ring-violet-100',
  },
  {
    title: 'Justiça Federal',
    description: 'Acesso às consultas da Justiça Federal e dos Tribunais Regionais Federais.',
    institutions: ['TRF da 1ª à 6ª Região', 'Seções judiciárias'],
    icon: Building2,
    accent: 'text-blue-600 bg-blue-50 ring-blue-100',
  },
  {
    title: 'Justiça Estadual',
    description: 'Consultas da justiça comum estadual nos tribunais de todo o país.',
    institutions: ['27 tribunais estaduais'],
    icon: Scale,
    accent: 'text-emerald-600 bg-emerald-50 ring-emerald-100',
  },
  {
    title: 'Justiça do Trabalho',
    description: 'Consultas de processos trabalhistas nas instâncias regionais e superiores.',
    institutions: ['TST', 'Tribunais Regionais do Trabalho'],
    icon: Gavel,
    accent: 'text-amber-600 bg-amber-50 ring-amber-100',
  },
  {
    title: 'Justiça Eleitoral',
    description: 'Consultas relacionadas à atuação da Justiça Eleitoral em todo o território nacional.',
    institutions: ['TSE', 'Tribunais Regionais Eleitorais'],
    icon: Vote,
    accent: 'text-rose-600 bg-rose-50 ring-rose-100',
  },
  {
    title: 'Justiça Militar',
    description: 'Consultas na Justiça Militar da União e nas estruturas estaduais existentes.',
    institutions: ['STM', 'Tribunais de Justiça Militar'],
    icon: Shield,
    accent: 'text-cyan-700 bg-cyan-50 ring-cyan-100',
  },
]

function AreaLink({ to }: { to: string }) {
  return <Link to={to} className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-[#102B46] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2035] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/25">
    Consultar processos <ArrowRight size={16} />
  </Link>
}

type LocalizacaoProcesso = { ramo: string; rota: string; tribunal: string; detalhe: string; alias: string }

const regioesEleitorais = [
  'ac', 'al', 'am', 'ap', 'ba', 'ce', 'dft', 'es', 'go', 'ma', 'mt', 'ms', 'mg',
  'pa', 'pb', 'pr', 'pe', 'pi', 'rj', 'rn', 'rs', 'ro', 'rr', 'sc', 'se', 'sp', 'to',
]
const regioesEstaduais = [
  'ac', 'al', 'am', 'ap', 'ba', 'ce', 'dft', 'es', 'go', 'ma', 'mt', 'ms', 'mg',
  'pa', 'pb', 'pr', 'pe', 'pi', 'rj', 'rn', 'rs', 'ro', 'rr', 'sc', 'se', 'sp', 'to',
]

function identificarLocalizacao(numero: string): LocalizacaoProcesso | null {
  const digitos = numero.replace(/\D/g, '')
  if (digitos.length !== 20) return null
  const segmento = digitos[13]
  const codigoRegiao = Number(digitos.slice(14, 16))
  if (segmento === '4' && codigoRegiao >= 1 && codigoRegiao <= 6) return {
    ramo: 'Justiça Federal', rota: '/integracao-orgaos/justica-federal', tribunal: `TRF da ${codigoRegiao}ª Região`,
    detalhe: 'O dígito 4 indica a Justiça Federal. Os dois dígitos seguintes identificam a região do Tribunal Regional Federal.', alias: `trf${codigoRegiao}`,
  }
  if (segmento === '5' && codigoRegiao >= 1 && codigoRegiao <= 24) return {
    ramo: 'Justiça do Trabalho', rota: '/integracao-orgaos/justica-trabalho', tribunal: `TRT da ${codigoRegiao}ª Região`,
    detalhe: 'O dígito 5 indica a Justiça do Trabalho. Os dois dígitos seguintes identificam a região do Tribunal Regional do Trabalho.', alias: `trt${codigoRegiao}`,
  }
  if (segmento === '6' && codigoRegiao >= 1 && codigoRegiao <= 27) {
    const uf = regioesEleitorais[codigoRegiao - 1]
    const nome = uf === 'dft' ? 'Distrito Federal e Territórios' : uf.toUpperCase()
    return { ramo: 'Justiça Eleitoral', rota: '/integracao-orgaos/justica-eleitoral', tribunal: `TRE-${nome}`,
      detalhe: 'O dígito 6 indica a Justiça Eleitoral. Os dois dígitos seguintes identificam a circunscrição do Tribunal Regional Eleitoral.', alias: `tre-${uf}` }
  }
  if (segmento === '8' && codigoRegiao >= 1 && codigoRegiao <= 27) {
    const uf = regioesEstaduais[codigoRegiao - 1]
    return { ramo: 'Justiça Estadual', rota: '/integracao-orgaos/justica-estadual', tribunal: `Tribunal de Justiça de ${uf.toUpperCase()}`,
      detalhe: 'O dígito 8 indica a Justiça Estadual. Os dois dígitos seguintes identificam o estado ou o Distrito Federal.', alias: `tj${uf}` }
  }
  if (segmento === '9' && [13, 21, 26].includes(codigoRegiao)) {
    const alias = ({ 13: 'tjmmg', 21: 'tjmrs', 26: 'tjmsp' } as Record<number, string>)[codigoRegiao]
    const estado = ({ 13: 'Minas Gerais', 21: 'Rio Grande do Sul', 26: 'São Paulo' } as Record<number, string>)[codigoRegiao]
    return { ramo: 'Justiça Militar Estadual', rota: '/integracao-orgaos/justica-militar', tribunal: `Tribunal de Justiça Militar de ${estado}`,
      detalhe: 'O dígito 9 indica a Justiça Militar Estadual. Os dois dígitos seguintes identificam o tribunal militar estadual.', alias }
  }
  if (segmento === '7') return { ramo: 'Justiça Militar da União', rota: '/integracao-orgaos/tribunais-superiores', tribunal: 'Superior Tribunal Militar (STM)',
    detalhe: 'O dígito 7 indica a Justiça Militar da União. O processo é consultado no Superior Tribunal Militar.', alias: 'stm' }
  if (segmento === '3') return { ramo: 'Tribunais Superiores', rota: '/integracao-orgaos/tribunais-superiores', tribunal: 'Superior Tribunal de Justiça (STJ)',
    detalhe: 'O dígito 3 indica processo originário de tribunal superior. O número identifica o STJ.', alias: 'stj' }
  return null
}

function LocalizadorProcesso() {
  const [numero, setNumero] = useState('')
  const [localizacao, setLocalizacao] = useState<LocalizacaoProcesso | null>(null)
  const [invalido, setInvalido] = useState(false)
  const navigate = useNavigate()
  function localizar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const encontrada = identificarLocalizacao(numero)
    setLocalizacao(encontrada)
    setInvalido(!encontrada)
  }
  return <section className="rounded-2xl border border-[#087E96]/20 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
    <div className="mb-4 flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#087E96]/10 text-[#087E96]"><MapPin size={20} /></span>
      <div><h2 className="text-base font-bold text-[#102B46] dark:text-white">Onde está o meu processo?</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Informe o número CNJ para identificar o ramo da Justiça e o tribunal indicado na numeração.</p></div>
    </div>
    <form onSubmit={localizar} className="flex flex-col gap-3 sm:flex-row">
      <label className="min-w-0 flex-1"><span className="sr-only">Número do processo no padrão CNJ</span>
        <input value={numero} onChange={(event) => setNumero(event.target.value)} inputMode="numeric" autoComplete="off" placeholder="0000000-00.0000.0.00.0000"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm tracking-wide text-slate-900 outline-none focus:border-[#087E96] focus:ring-4 focus:ring-[#087E96]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white" /></label>
      <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#102B46] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0B2035]"><Search size={17} /> Identificar processo</button>
    </form>
    {invalido && <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300"><CircleAlert size={17} /> Não foi possível identificar a Justiça. Confira se informou os 20 dígitos do número CNJ e se o segmento está disponível.</p>}
    {localizacao && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Localização identificada</p>
      <h3 className="mt-1 font-bold text-slate-900 dark:text-white">{localizacao.ramo} · {localizacao.tribunal}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">{localizacao.detalhe}</p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">A identificação é feita pelos dígitos do padrão CNJ e indica a jurisdição de origem; a confirmação dos dados do processo depende da consulta ao tribunal.</p>
      <button type="button" onClick={() => navigate(`${localizacao.rota}?tribunal=${localizacao.alias}&numero=${numero.replace(/\D/g, '')}`)}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#087E96] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#065F73]">Abrir consulta deste tribunal <ArrowRight size={16} /></button>
    </div>}
  </section>
}

export function IntegracaoOrgaosPage() {
  return <div className="flex h-screen flex-col bg-gray-50">
    <Topbar hideModuleBar hideUserMenu title="" />
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageBanner
          section="Integrações"
          title="Integração com Órgãos"
          description="Acesse consultas organizadas por ramo do Poder Judiciário."
        />

        <LocalizadorProcesso />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Categorias de consulta">
          {areas.map(({ title, description, institutions, icon: Icon, accent }) => <article key={title} className="group flex min-h-60 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#087E96]/35 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${accent}`}><Icon size={21} /></span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">Consulta</span>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {institutions.map((institution) => <span key={institution} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">{institution}</span>)}
            </div>
            {title === 'Tribunais Superiores' && (
              <Link to="/integracao-orgaos/tribunais-superiores" className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-[#102B46] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2035] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/25">
                Consultar processos <ArrowRight size={16} />
              </Link>
            )}
            {title === 'Justiça Estadual' && (
              <Link to="/integracao-orgaos/justica-estadual" className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-[#102B46] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2035] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/25">
                Consultar processos <ArrowRight size={16} />
              </Link>
            )}
            {title === 'Justiça Federal' && <AreaLink to="/integracao-orgaos/justica-federal" />}
            {title === 'Justiça do Trabalho' && <AreaLink to="/integracao-orgaos/justica-trabalho" />}
            {title === 'Justiça Eleitoral' && <AreaLink to="/integracao-orgaos/justica-eleitoral" />}
            {title === 'Justiça Militar' && <AreaLink to="/integracao-orgaos/justica-militar" />}
          </article>)}
        </section>
      </div>
    </main>
  </div>
}
