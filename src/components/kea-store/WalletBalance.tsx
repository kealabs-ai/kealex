import { Coins, Plus, ShieldAlert } from 'lucide-react'

interface WalletBalanceProps {
  onRecharge: () => void
  balance?: number
  isLoading?: boolean
  isError?: boolean
}

export function WalletBalance({ onRecharge, balance, isLoading = false, isError = false }: WalletBalanceProps) {
  return (
    <section aria-label="Saldo da carteira de créditos" className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-[#102B46] shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-slate-700 dark:bg-[#102238] dark:text-white">
      <div className="flex items-center gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#00C2A8]/10 text-[#087E96] dark:bg-[#20B987]/10 dark:text-[#20B987]"><Coins size={24} aria-hidden="true" /></div>
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Saldo da carteira do escritório</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{isLoading ? '…' : balance === undefined ? '—' : balance.toLocaleString('pt-BR')} <span className="text-base font-semibold text-slate-500 dark:text-slate-400">KeaCredits</span></p>
          {isError && <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300"><ShieldAlert size={13} />Não foi possível atualizar o saldo</p>}
        </div>
      </div>
      <button type="button" onClick={onRecharge} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#00C2A8] px-4 text-sm font-bold text-white transition hover:bg-[#00a896] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2A8]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#102238]">
        <Plus size={17} />Recarregar créditos
      </button>
    </section>
  )
}
