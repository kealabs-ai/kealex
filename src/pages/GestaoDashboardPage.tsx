import { Activity, BarChart3, Coins, Search, Users, type LucideIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageBanner } from '../components/PageBanner'
import { gestaoApi } from '../api/gestao'
import { fmt } from '../utils/formatters'

function MetricCard({ title, value, detail, icon: Icon }: { title: string; value: string; detail?: string; icon: LucideIcon }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-sm text-slate-500 dark:text-slate-400">{title}</p><p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>{detail && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{detail}</p>}</div>
      <span className="rounded-xl bg-teal-50 p-3 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"><Icon size={20} /></span>
    </div>
  </article>
}

export function GestaoDashboardPage() {
  const dashboard = useQuery({ queryKey: ['gestao', 'dashboard'], queryFn: gestaoApi.dashboard, staleTime: 30_000, refetchInterval: 60_000 })
  const data = dashboard.data
  const totais = data?.financeiro
  const max = Math.max(totais?.totalPago ?? 0, totais?.totalPendente ?? 0, totais?.totalVencido ?? 0, 1)
  const bars = [
    { label: 'Pago', value: totais?.totalPago ?? 0, color: 'bg-emerald-500' },
    { label: 'Pendente', value: totais?.totalPendente ?? 0, color: 'bg-amber-500' },
    { label: 'Vencido', value: totais?.totalVencido ?? 0, color: 'bg-rose-500' },
  ]

  return <div className="kea-process-page"><div className="kea-process-content">
    <PageBanner section="Gestão" title="Dashboard" description="Indicadores de utilização, carteira de créditos e visão financeira da plataforma." />
    <section aria-label="Indicadores de utilização" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Indicadores de utilização" value={dashboard.isLoading ? '…' : data ? String(data.processosAtivos) : '—'} detail="Processos ativos nesta organização" icon={Activity} />
      <MetricCard title="KeaCredits disponível" value={dashboard.isLoading ? '…' : data ? data.keaCreditsDisponivel.toLocaleString('pt-BR') : '—'} detail="Saldo atual da carteira" icon={Coins} />
      <MetricCard title="Quantidade de consultas" value={dashboard.isLoading ? '…' : data ? data.consultasTotal.toLocaleString('pt-BR') : '—'} detail="Consultas FiscalAPI registradas" icon={Search} />
      <MetricCard title="Usuários cadastrados" value={dashboard.isLoading ? '…' : data ? String(data.usuariosCadastrados) : '—'} detail="Usuários desta organização" icon={Users} />
    </section>

    <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2"><Users size={18} className="text-teal-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Top 10 clientes com mais consultas</h2></div>
        {data?.topClientesConsultas.length ? <ol className="mt-4 space-y-2">
          {data.topClientesConsultas.map((cliente, index) => <li key={cliente.clienteId} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800"><span className="flex min-w-0 items-center gap-3"><span className="font-semibold text-teal-700 dark:text-teal-300">{index + 1}.</span><span className="truncate text-slate-700 dark:text-slate-200">{cliente.nome}</span></span><strong className="shrink-0 text-slate-900 dark:text-white">{cliente.quantidade}</strong></li>)}
        </ol> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{dashboard.isLoading ? 'Carregando…' : 'Não há consultas vinculadas aos clientes cadastrados.'}</p>}
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2"><BarChart3 size={18} className="text-teal-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Gráficos financeiros</h2></div>
        <div className="mt-5 space-y-4">
          {bars.map((bar) => <div key={bar.label}>
            <div className="mb-1 flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">{bar.label}</span><strong className="text-slate-900 dark:text-white">{dashboard.isLoading ? '…' : totais ? fmt(bar.value) : '—'}</strong></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${bar.color}`} style={{ width: `${Math.max(0, (bar.value / max) * 100)}%` }} /></div>
          </div>)}
        </div>
      </article>
    </section>
  </div></div>
}
