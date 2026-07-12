import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Search, Plus, X } from 'lucide-react'
import { useCobrancas, useProximaFase, useMarcarPago, useCancelarCobranca, useCreateCobranca } from '../hooks/useCobrancaFluxo'
import { CobrancaFluxoComponent } from '../components/CobrancaFluxo'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { Button } from '../components/UI'
import { TopBar } from '../components/TopBar'

const fmt = (c: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)

export function CobrancaPage() {
  const { data: cobrancas = [], isLoading } = useCobrancas()
  const proximaFase = useProximaFase()
  const marcarPago = useMarcarPago()
  const cancelar = useCancelarCobranca()
  const criar = useCreateCobranca()

  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'pago' | 'cancelado'>('todos')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ processoId: '', clienteId: '', valorCentavos: '', dataVencimento: '' })

  const filtered = cobrancas.filter((c) => {
    const matchSearch = c.processoId.toLowerCase().includes(search.toLowerCase()) || c.clienteId.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus
    return matchSearch && matchStatus
  })

  const stats = [
    {
      label: 'Total em Cobrança',
      value: fmt(filtered.filter((c) => c.status !== 'cancelado').reduce((acc, c) => acc + c.valorCentavos, 0)),
      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      icon: <TrendingUp size={18} />,
    },
    {
      label: 'Pendentes',
      value: filtered.filter((c) => c.status === 'pendente').length,
      gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
      icon: <Clock size={18} />,
    },
    {
      label: 'Em Cobrança',
      value: filtered.filter((c) => c.status === 'pendente' && c.faseAtual >= 2).length,
      gradient: 'linear-gradient(135deg,#ef4444,#dc2626)',
      icon: <AlertTriangle size={18} />,
    },
    {
      label: 'Pagos',
      value: filtered.filter((c) => c.status === 'pago').length,
      gradient: 'linear-gradient(135deg,#10b981,#059669)',
      icon: <CheckCircle size={18} />,
    },
  ]

  const handleCriar = async () => {
    if (!form.processoId || !form.clienteId || !form.valorCentavos) return
    await criar.mutateAsync({
      processoId: form.processoId,
      clienteId: form.clienteId,
      valorCentavos: Math.round(parseFloat(form.valorCentavos) * 100),
      dataVencimento: form.dataVencimento || undefined,
    })
    setShowModal(false)
    setForm({ processoId: '', clienteId: '', valorCentavos: '', dataVencimento: '' })
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
      <TopBar
        icon={TrendingUp}
        title="Gestão de Cobrança"
        subtitle="Acompanhe o fluxo de cobrança com controle de fases"
        actions={<Button onClick={() => setShowModal(true)}><Plus size={16} className="mr-1" />Nova Cobrança</Button>}
      />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
        </div>

        {/* Filtros */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por processo ou cliente..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-950 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {(['todos', 'pendente', 'pago', 'cancelado'] as const).map((s) => (
                <motion.button
                  key={s}
                  onClick={() => setFiltroStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    filtroStatus === s ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:ring-2 hover:ring-indigo-400'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {s === 'todos' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Lista */}
        {isLoading ? (
          <DataCard delay={0.3}>
            <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</div>
          </DataCard>
        ) : filtered.length === 0 ? (
          <DataCard delay={0.3}>
            <EmptyState message="Nenhuma cobrança encontrada" icon={<TrendingUp size={28} className="text-gray-300" />} />
          </DataCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filtered.map((cobranca, idx) => (
                <motion.div
                  key={cobranca.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <CobrancaFluxoComponent
                    cobranca={cobranca}
                    onProximaFase={(id) => proximaFase.mutate(id)}
                    onMarcarPago={(id) => marcarPago.mutate({ id })}
                    onCancelar={(id) => cancelar.mutate({ id })}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal Nova Cobrança */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 w-full max-w-md mx-4 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nova Cobrança</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'ID do Processo', key: 'processoId', placeholder: 'uuid do processo' },
                  { label: 'ID do Cliente', key: 'clienteId', placeholder: 'uuid do cliente' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">{label}</label>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-950 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valorCentavos}
                    onChange={(e) => setForm((f) => ({ ...f, valorCentavos: e.target.value }))}
                    placeholder="0,00"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-950 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={form.dataVencimento}
                    onChange={(e) => setForm((f) => ({ ...f, dataVencimento: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-950 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCriar}
                  disabled={criar.isPending}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {criar.isPending ? 'Criando...' : 'Criar Cobrança'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
