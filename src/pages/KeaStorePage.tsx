import { useState } from 'react'
import { ArrowRight, Info, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CreditsTopUpModal } from '../components/kea-store/CreditsTopUpModal'
import { ServiceCard } from '../components/kea-store/ServiceCard'
import { WalletBalance } from '../components/kea-store/WalletBalance'
import { keaStoreCategories, keaStoreServices, type KeaStoreService } from '../data/keaStoreServices'
import { useToast } from '../components/Toast'
import { PageBanner } from '../components/PageBanner'
import { useQuery } from '@tanstack/react-query'
import { keaCreditsApi, KEA_CREDITS_QUERY_KEY } from '../api/keaCredits'

export function KeaStorePage() {
  const [topUpOpen, setTopUpOpen] = useState(false)
  const navigate = useNavigate()
  const { warning } = useToast()
  const walletQuery = useQuery({
    queryKey: KEA_CREDITS_QUERY_KEY,
    queryFn: keaCreditsApi.wallet,
    staleTime: 5_000,
    refetchInterval: 30_000,
  })

  const handleServiceAction = (service: KeaStoreService) => {
    if (service.destination) {
      navigate(service.destination)
      return
    }
    warning(`${service.title}: a integração de execução será habilitada em breve.`)
  }

  return (
    <div className="kea-process-page">
      <div className="kea-process-content">
        <PageBanner section="Ecossistema" title="Kea Store" description="Acesse automações, consultas e serviços para acompanhar cada etapa do trabalho jurídico." />

        <WalletBalance onRecharge={() => setTopUpOpen(true)} balance={walletQuery.data?.saldoKeaCredits} isLoading={walletQuery.isLoading} isError={walletQuery.isError} />

        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <Info size={17} className="mt-0.5 shrink-0 text-orange-500" />
          <p className="text-xs leading-5">Créditos e valores exibidos são estimativas ilustrativas. O preço final e a disponibilidade dependem da configuração comercial de cada serviço.</p>
        </div>

        {keaStoreCategories.map((category) => {
          const services = keaStoreServices.filter((service) => service.category === category)
          return (
            <section key={category} aria-labelledby={`kea-store-${category}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">Kea Store</p>
                  <h2 id={`kea-store-${category}`} className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{category}</h2>
                </div>
                <ArrowRight size={18} className="text-slate-400" aria-hidden="true" />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {services.map((service) => <ServiceCard key={service.id} service={service} onAction={handleServiceAction} />)}
              </div>
            </section>
          )
        })}

        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          <Store size={18} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-300" />
          <p className="text-sm leading-6">Os serviços com integração ativa levam você à ferramenta correspondente. Os demais estão no catálogo e serão liberados conforme as integrações da Kea Store forem conectadas.</p>
        </div>
      </div>

      {topUpOpen && <CreditsTopUpModal onClose={() => setTopUpOpen(false)} />}
    </div>
  )
}
