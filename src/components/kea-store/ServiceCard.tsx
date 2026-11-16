import { ArrowUpRight, Coins } from 'lucide-react'
import type { KeaStoreService } from '../../data/keaStoreServices'

interface ServiceCardProps {
  service: KeaStoreService
  onAction: (service: KeaStoreService) => void
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function ServiceCard({ service, onAction }: ServiceCardProps) {
  const Icon = service.icon
  const value = service.credits * service.estimatedUnitValue

  return (
    <article className="kea-data-card group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#087E96]/45 hover:shadow-lg dark:border-slate-700 dark:bg-[#102238] dark:text-white">
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-12 place-items-center rounded-xl border border-[#087E96]/15 bg-[#087E96]/10 text-[#087E96] dark:border-[#20B987]/20 dark:bg-[#20B987]/10 dark:text-[#20B987]">
          <Icon size={23} strokeWidth={1.8} aria-hidden="true" />
        </div>
        <span className="rounded-full border border-[#00C2A8]/25 bg-[#00C2A8]/10 px-3 py-1.5 text-xs font-semibold text-[#087E96] dark:border-[#20B987]/25 dark:bg-[#20B987]/10 dark:text-[#20B987]">
          <Coins size={13} className="mr-1.5 inline" aria-hidden="true" />{service.credits} KeaCredits
        </span>
      </div>

      <div className="mt-5 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{service.category}</p>
        <h3 className="mt-2 text-lg font-semibold leading-snug text-[#102B46] dark:text-white">{service.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#596B82] dark:text-slate-300">{service.description}</p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
        <div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Valor equivalente estimado</p>
          <p className="mt-0.5 text-sm font-semibold text-[#F96313]">≈ {currency.format(value)}</p>
        </div>
        <button type="button" onClick={() => onAction(service)} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#087E96] px-3.5 text-xs font-bold text-white transition hover:bg-[#066b80] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087E96]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#102238]">
          {service.actionLabel}<ArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
