import { ArrowUpRight, Coins } from 'lucide-react'
import { PageBanner } from '../components/PageBanner'

const providers = [
  { name: 'Escavador', description: 'Consulte o saldo e recarregue créditos para uso da API Escavador.', url: 'https://api.escavador.com/' },
  { name: 'FiscalAPI', description: 'Gerencie o plano e compre créditos extras da conta FiscalAPI.', url: 'https://app.fiscalapi.com.br/' },
]

export function GestaoCreditosPage() {
  return <div className="kea-process-page"><div className="kea-process-content">
    <PageBanner section="Gestão" title="Gestão de créditos" description="Acompanhe as opções de compra de créditos dos provedores integrados." />
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {providers.map((provider) => <article key={provider.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="mb-4 inline-flex rounded-xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"><Coins size={22} /></span>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Compra de créditos {provider.name}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{provider.description}</p>
        <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">O fornecedor processa saldo e pagamentos no próprio painel. A Kealex não recebe nem armazena os dados de pagamento dessa compra.</p>
        <a href={provider.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
          Acessar painel {provider.name} <ArrowUpRight size={16} />
        </a>
      </article>)}
    </div>
  </div></div>
}
