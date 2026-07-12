import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, DollarSign, TrendingUp, Search, AlertTriangle, Target, Activity, BarChart2, Clock, TrendingDown, Zap } from 'lucide-react'
import { useHonorarios, useDashboardFinanceiro, useCreateHonorario, useUpdateHonorario, useDeleteHonorario } from '../hooks/useFinanceiro'
import { useProcessos } from '../hooks/useProcessos'
import { useClientes } from '../hooks/useClientes'
import { AreaChart } from '../components/AreaChart'
import { useTheme } from '../context/ThemeContext'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { statusHonorarioBadge } from '../components/Badge'
import { Button, Input, Select } from '../components/UI'
import { TopBar } from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import type { Honorario, StatusHonorario } from '../types'

type FormData = {
  processoId: string; clienteId: string; descricao: string
  valorCentavos: number; dataVencimento: string
  status?: StatusHonorario; dataPagamento?: string
}

const fmt = (c: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)

const diasRestantes = (data: string) => {
  const diff = new Date(data).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function FinanceiroPage() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const isCliente = user?.role === 'cliente'
  const { data: honorarios, isLoading, error } = useHonorarios()
  const { data: dashboard } = useDashboardFinanceiro()
  const { data: processos } = useProcessos()
  const { data: clientes } = !isCliente ? useClientes() : { data: undefined }
  const create = useCreateHonorario()
  const update = useUpdateHonorario()
  const remove = useDeleteHonorario()
  const [editing, setEditing] = useState<Honorario | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset } = useForm<FormData>()

  if (error) {
    console.error('Erro ao carregar honorários:', error)
  }

  const honorariosList = Array.isArray(honorarios) ? honorarios : []

  const openCreate = () => { reset({}); setEditing(null); setOpen(true) }
  const openEdit = (h: Honorario) => {
    reset({ ...h, dataVencimento: h.dataVencimento.slice(0, 10), dataPagamento: h.dataPagamento?.slice(0, 10) })
    setEditing(h); setOpen(true)
  }
  const close = () => setOpen(false)
  const onSubmit = (data: FormData) => {
    const payload = { ...data, valorCentavos: Number(data.valorCentavos) }
    if (editing) update.mutate({ id: editing.id, data: payload }, { onSuccess: close })
    else create.mutate(payload, { onSuccess: close })
  }

  const filtered = honorariosList.filter((h) => h?.descricao && h.descricao.toLowerCase().includes(search.toLowerCase()))

  const vencendo = honorariosList.filter((h) => {
    if (h?.status !== 'pendente') return false
    const dias = diasRestantes(h.dataVencimento)
    return dias <= 7
  })

  // ── KPIs calculados ──────────────────────────────────────────────
  const kpis = useMemo(() => {
    const pagos = honorariosList.filter((h) => h.status === 'pago')
    const pendentes = honorariosList.filter((h) => h.status === 'pendente')
    const vencidos = honorariosList.filter((h) => h.status === 'vencido')
    const total = honorariosList.length || 1

    const ticketMedio = pagos.length > 0
      ? pagos.reduce((s, h) => s + h.valorCentavos, 0) / pagos.length
      : 0

    const taxaAdimplencia = Math.round((pagos.length / total) * 100)
    const taxaInadimplencia = Math.round((vencidos.length / total) * 100)

    // Previsão: média mensal dos últimos pagamentos × 3 meses
    const mediaReceitaMensal = dashboard?.totalPago
      ? Math.round(dashboard.totalPago / 6)
      : 0
    const previsao3m = mediaReceitaMensal * 3
    const previsao6m = mediaReceitaMensal * 6

    // Processos: ativos vs total
    const processosAtivos = Array.isArray(processos)
      ? processos.filter((p) => p.status === 'ativo').length
      : 0
    const processosTotal = Array.isArray(processos) ? processos.length : 0
    const receitaPorProcesso = processosAtivos > 0 && dashboard?.totalGeral
      ? Math.round(dashboard.totalGeral / processosAtivos)
      : 0

    // Próximo vencimento
    const proximoVencimento = pendentes
      .filter((h) => diasRestantes(h.dataVencimento) > 0)
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())[0]

    return {
      ticketMedio,
      taxaAdimplencia,
      taxaInadimplencia,
      previsao3m,
      previsao6m,
      mediaReceitaMensal,
      processosAtivos,
      processosTotal,
      receitaPorProcesso,
      proximoVencimento,
      totalPendentes: pendentes.length,
    }
  }, [honorariosList, dashboard, processos])

  const chartData = [
    { label: 'Jan', receita: 15000, despesa: 8000 },
    { label: 'Fev', receita: 22000, despesa: 9500 },
    { label: 'Mar', receita: 18500, despesa: 7200 },
    { label: 'Abr', receita: 28000, despesa: 11000 },
    { label: 'Mai', receita: 32000, despesa: 12500 },
    { label: 'Jun', receita: 25000, despesa: 10000 },
  ]

  const stats = dashboard ? [
    { label: 'Total Geral', value: fmt(dashboard.totalGeral), gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <TrendingUp size={18} /> },
    { label: 'Pago', value: fmt(dashboard.totalPago), gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <DollarSign size={18} /> },
    { label: 'Pendente', value: fmt(dashboard.totalPendente), gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <DollarSign size={18} /> },
    { label: 'Vencido', value: fmt(dashboard.totalVencido), gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: <DollarSign size={18} /> },
  ] : []

  if (isCliente && stats.length > 0) {
    stats[0].label = 'Total a Pagar'
    stats[1].label = 'Já Pago'
    stats[2].label = 'Em Aberto'
    stats[3].label = 'Atrasado'
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-transparent">
      <TopBar
        icon={DollarSign}
        title="Gestão Financeira"
        subtitle={isCliente ? "Acompanhe seus honorários e pagamentos" : "Análise de receitas, despesas e faturamento"}
        actions={!isCliente && <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Honorário</Button>}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {stats.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07} />)}
          </div>
        )}

        {/* ── KPIs & Previsões ── */}
        {!isCliente && dashboard && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="space-y-3"
          >
            {/* Linha 1: KPIs operacionais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Ticket Médio */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-indigo-950/40 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ticket Médio</span>
                  <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
                    <Target size={13} className="text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(kpis.ticketMedio)}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">por honorário pago</p>
              </div>

              {/* Taxa de Adimplência */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-indigo-950/40 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Adimplência</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                    <Activity size={13} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{kpis.taxaAdimplencia}%</p>
                <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${kpis.taxaAdimplencia}%` }}
                  />
                </div>
              </div>

              {/* Inadimplência */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-indigo-950/40 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Inadimplência</span>
                  <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
                    <TrendingDown size={13} className="text-rose-600 dark:text-rose-400" />
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{kpis.taxaInadimplencia}%</p>
                <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-700"
                    style={{ width: `${kpis.taxaInadimplencia}%` }}
                  />
                </div>
              </div>

              {/* Receita por Processo */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-indigo-950/40 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Receita / Processo</span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                    <BarChart2 size={13} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(kpis.receitaPorProcesso)}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{kpis.processosAtivos} processos ativos</p>
              </div>
            </div>

            {/* Linha 2: Previsões */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Previsão 3 meses */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 shadow-lg shadow-indigo-200/40 dark:shadow-indigo-950/40 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">Previsão 3 Meses</p>
                    <p className="text-2xl font-bold mt-1">{fmt(kpis.previsao3m)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <TrendingUp size={18} className="text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-200">
                  <Zap size={11} />
                  <span>Baseado em {fmt(kpis.mediaReceitaMensal)}/mês</span>
                </div>
              </div>

              {/* Previsão 6 meses */}
              <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 shadow-lg shadow-violet-200/40 dark:shadow-violet-950/40 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-violet-200 uppercase tracking-wide">Previsão 6 Meses</p>
                    <p className="text-2xl font-bold mt-1">{fmt(kpis.previsao6m)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <BarChart2 size={18} className="text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-violet-200">
                  <Activity size={11} />
                  <span>{kpis.processosTotal} processos na carteira</span>
                </div>
              </div>

              {/* Próximo vencimento + pendentes */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-indigo-950/40 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Próximo Vencimento</p>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                    <Clock size={13} className="text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                {kpis.proximoVencimento ? (
                  <>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{fmt(kpis.proximoVencimento.valorCentavos)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{kpis.proximoVencimento.descricao}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-lg">
                        <Clock size={10} />
                        {diasRestantes(kpis.proximoVencimento.dataVencimento)}d restantes
                      </span>
                      <span className="text-xs text-slate-400">{kpis.totalPendentes} pendentes no total</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Nenhum vencimento próximo</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Gráfico de Tendência */}
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-indigo-950/40 p-6 overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tendência Financeira</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-slate-600 dark:text-slate-400">Despesas</span>
              </div>
            </div>
          </div>
          <AreaChart data={chartData} height={280} isDark={isDark} />
        </motion.div>

        {vencendo.length > 0 && (
          <motion.div
            className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-4"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl shrink-0">
                <AlertTriangle size={16} className="text-rose-600 dark:text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">{vencendo.length} honorário(s) {isCliente ? 'a vencer' : 'vencendo'} nos próximos 7 dias</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vencendo.map((h) => {
                    const dias = diasRestantes(h.dataVencimento)
                    return (
                      <span key={h.id} className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-500/30 rounded-lg px-2.5 py-1 text-xs text-rose-700 dark:text-rose-400">
                        <DollarSign size={11} />
                        {h.descricao}
                        <span className="font-bold">{fmt(h.valorCentavos)}</span>
                        <span className="font-bold">{dias <= 0 ? 'vencido' : `${dias}d`}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <DataCard delay={0.25}>
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-indigo-950/40">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar honorário..." className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border border-slate-200 dark:border-indigo-950/60 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-indigo-950/40">
                {['Descrição', 'Valor', 'Vencimento', 'Pagamento', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyState message="Nenhum honorário encontrado" icon={<DollarSign size={28} className="text-slate-300" />} /></td></tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((h, i) => (
                    <motion.tr
                      key={h.id}
                      className="border-b border-slate-50 dark:border-indigo-950/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors group"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">{h.descricao}</td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-900 dark:text-slate-100">{fmt(h.valorCentavos)}</td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{new Date(h.dataVencimento).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{h.dataPagamento ? new Date(h.dataPagamento).toLocaleDateString('pt-BR') : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                      <td className="px-4 py-3.5">{statusHonorarioBadge(h.status)}</td>
                      <td className="px-4 py-3.5">
                        {!isCliente && (
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(h)} className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => remove.mutate(h.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"><Trash2 size={14} /></button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </DataCard>
      </div>

      {open && !isCliente && (
        <Modal title={editing ? 'Editar Honorário' : 'Novo Honorário'} subtitle="Registre os honorários do processo jurídico" onClose={close} size="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Processo" {...register('processoId')}>
                <option value="">Selecione...</option>
                {Array.isArray(processos) && processos.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
              </Select>
              <Select label="Cliente" {...register('clienteId')}>
                <option value="">Selecione...</option>
                {Array.isArray(clientes) && clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </div>
            <Input label="Descrição" {...register('descricao')} placeholder="Ex: Honorários advocatícios" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Valor (centavos)" {...register('valorCentavos')} type="number" placeholder="Ex: 150000 = R$ 1.500,00" />
              <Input label="Data de Vencimento" {...register('dataVencimento')} type="date" />
            </div>
            {editing && (
              <div className="grid grid-cols-2 gap-3">
                <Select label="Status" {...register('status')}>
                  {['pendente', 'pago', 'vencido', 'cancelado'].map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label="Data de Pagamento" {...register('dataPagamento')} type="date" />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-indigo-950/40">
              <Button variant="secondary" type="button" onClick={close}>Cancelar</Button>
              <Button type="submit" loading={create.isPending || update.isPending}>Salvar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
