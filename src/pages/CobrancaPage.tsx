import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Search, Plus, X } from 'lucide-react'
import { useCobrancas, useProximaFase, useMarcarPago, useCancelarCobranca, useCreateCobranca, useCobrancaTimeline } from '../hooks/useCobrancaFluxo'
import { useClientes } from '../hooks/useClientes'
import { useProcessos } from '../hooks/useProcessos'
import { CobrancaFluxoComponent } from '../components/CobrancaFluxo'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { Button } from '../components/UI'
import { TopBar } from '../components/TopBar'
import type { CobrancaTimeline } from '../api/cobrancas'

const fmt = (c: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)

// Componente wrapper para carregar a timeline de cada cobrança sob demanda
function CobrancaCard({
  cobranca,
  clienteNome,
  processoTitulo,
  processoNumero,
  onProximaFase,
  onMarcarPago,
  onCancelar,
}: {
  cobranca: Parameters<typeof CobrancaFluxoComponent>[0]['cobranca']
  clienteNome?: string
  processoTitulo?: string
  processoNumero?: string
  onProximaFase: (id: string) => void
  onMarcarPago: (id: string) => void
  onCancelar: (id: string) => void
}) {
  const [timelineId, setTimelineId] = useState<string | undefined>()
  const { data: timeline } = useCobrancaTimeline(timelineId)

  return (
    <CobrancaFluxoComponent
      cobranca={cobranca}
      clienteNome={clienteNome}
      processoTitulo={processoTitulo}
      processoNumero={processoNumero}
      timeline={timeline as CobrancaTimeline | undefined}
      onProximaFase={onProximaFase}
      onMarcarPago={onMarcarPago}
      onCancelar={onCancelar}
      onLoadTimeline={(id) => setTimelineId(id)}
    />
  )
}

export function CobrancaPage() {
  const { data: cobrancas = [], isLoading } = useCobrancas()
  const { data: clientes = [] } = useClientes()
  const { data: processos = [] } = useProcessos()
  const proximaFase = useProximaFase()
  const marcarPago = useMarcarPago()
  const cancelar = useCancelarCobranca()
  const criar = useCreateCobranca()

  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'pago' | 'cancelado'>('todos')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ processoId: '', clienteId: '', valorCentavos: '', dataVencimento: '' })

  // Mapas para lookup rápido
  const clienteMap = Object.fromEntries((Array.isArray(clientes) ? clientes : []).map((c) => [c.id, c]))
  const processoMap = Object.fromEntries((Array.isArray(processos) ? processos : []).map((p) => [p.id, p]))

  // Processos filtrados pelo cliente selecionado no modal
  const processosDoCliente = form.clienteId
    ? (Array.isArray(processos) ? processos : []).filter((p) => p.clienteId === form.clienteId)
    : (Array.isArray(processos) ? processos : [])

  const filtered = cobrancas.filter((c) => {
    const cliente = clienteMap[c.clienteId]
    const processo = processoMap[c.processoId]
    const term = search.toLowerCase()
    const matchSearch =
      !term ||
      cliente?.nome?.toLowerCase().includes(term) ||
      processo?.titulo?.toLowerCase().includes(term) ||
      processo?.numero?.toLowerCase().includes(term)
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
      value: filtered.filter((c) => c.status === 'pendente' && c.faseAtual < 2).length,
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

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-950 transition-all'
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1 uppercase tracking-wide'

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
      <TopBar
        icon={TrendingUp}
        title="Gestão de Cobrança"
        subtitle="Acompanhe o fluxo de cobrança vinculado a clientes e processos"
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={15} className="mr-1" />Nova Cobrança
          </Button>
        }
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por cliente, processo ou número..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-950 transition-all"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              {(['todos', 'pendente', 'pago', 'cancelado'] as const).map((s) => (
                <motion.button
                  key={s}
                  onClick={() => setFiltroStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    filtroStatus === s
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
            <EmptyState
              message="Nenhuma cobrança encontrada"
              icon={<TrendingUp size={28} className="text-gray-300" />}
            />
          </DataCard>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <AnimatePresence>
              {filtered.map((cobranca, idx) => {
                const cliente = clienteMap[cobranca.clienteId]
                const processo = processoMap[cobranca.processoId]
                return (
                  <motion.div
                    key={cobranca.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <CobrancaCard
                      cobranca={cobranca}
                      clienteNome={cliente?.nome}
                      processoTitulo={processo?.titulo}
                      processoNumero={processo?.numero}
                      onProximaFase={(id) => proximaFase.mutate(id)}
                      onMarcarPago={(id) => marcarPago.mutate({ id })}
                      onCancelar={(id) => cancelar.mutate({ id })}
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal Nova Cobrança */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Nova Cobrança</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Vincule a um cliente e processo</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Cliente */}
                <div>
                  <label className={labelCls}>Cliente</label>
                  <select
                    value={form.clienteId}
                    onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value, processoId: '' }))}
                    className={inputCls}
                  >
                    <option value="">Selecione um cliente...</option>
                    {(Array.isArray(clientes) ? clientes : []).map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Processo */}
                <div>
                  <label className={labelCls}>Processo</label>
                  <select
                    value={form.processoId}
                    onChange={(e) => setForm((f) => ({ ...f, processoId: e.target.value }))}
                    className={inputCls}
                    disabled={!form.clienteId}
                  >
                    <option value="">
                      {form.clienteId ? 'Selecione um processo...' : 'Selecione um cliente primeiro'}
                    </option>
                    {processosDoCliente.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.numero ? `${p.numero} — ` : ''}{p.titulo}
                      </option>
                    ))}
                  </select>
                  {form.clienteId && processosDoCliente.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">Nenhum processo encontrado para este cliente</p>
                  )}
                </div>

                {/* Valor */}
                <div>
                  <label className={labelCls}>Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.valorCentavos}
                    onChange={(e) => setForm((f) => ({ ...f, valorCentavos: e.target.value }))}
                    placeholder="0,00"
                    className={inputCls}
                  />
                </div>

                {/* Data de vencimento */}
                <div>
                  <label className={labelCls}>Data de Vencimento <span className="text-gray-400 normal-case font-normal">(opcional)</span></label>
                  <input
                    type="date"
                    value={form.dataVencimento}
                    onChange={(e) => setForm((f) => ({ ...f, dataVencimento: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Preview do vínculo */}
              {form.clienteId && form.processoId && (
                <motion.div
                  className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Vínculo da cobrança</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    <span className="font-medium">{clienteMap[form.clienteId]?.nome}</span>
                    {' → '}
                    <span className="font-medium">{processoMap[form.processoId]?.titulo}</span>
                  </p>
                </motion.div>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCriar}
                  disabled={criar.isPending || !form.processoId || !form.clienteId || !form.valorCentavos}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
