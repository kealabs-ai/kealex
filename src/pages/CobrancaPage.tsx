import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react'
import { useHonorarios } from '../hooks/useFinanceiro'
import { CobrancaFluxoComponent, type CobrancaFase } from '../components/CobrancaFluxo'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { Button } from '../components/UI'
import { TopBar } from '../components/TopBar'

const fmt = (c: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)

export function CobrancaPage() {
  const { data: honorarios, isLoading } = useHonorarios()
  const [search, setSearch] = useState('')
  const [filtroFase, setFiltroFase] = useState<CobrancaFase | 'todos'>('todos')

  const honorariosList = Array.isArray(honorarios) ? honorarios : []

  // Simular dados de fluxo de cobrança (em produção viriam do backend)
  const fluxosCobranca = honorariosList.map((h) => ({
    id: h.id,
    honorarioId: h.id,
    fase: (h.status === 'pago' ? 'pago' : h.status === 'vencido' ? 'cobranca1' : 'pendente') as CobrancaFase,
    dataInicio: new Date(h.dataVencimento),
    dataUltimaAcao: new Date(h.dataVencimento),
    proximaAcao: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    descricao: h.descricao,
    valor: h.valorCentavos,
  }))

  const filtered = fluxosCobranca.filter((f) => {
    const matchSearch = f.descricao.toLowerCase().includes(search.toLowerCase())
    const matchFase = filtroFase === 'todos' || f.fase === filtroFase
    return matchSearch && matchFase
  })

  const stats = [
    {
      label: 'Total em Cobrança',
      value: fmt(filtered.reduce((acc, f) => acc + f.valor, 0)),
      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      icon: <TrendingUp size={18} />,
    },
    {
      label: 'Pendentes',
      value: filtered.filter((f) => f.fase === 'pendente').length,
      gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
      icon: <Clock size={18} />,
    },
    {
      label: 'Em Cobrança',
      value: filtered.filter((f) => ['notificacao', 'cobranca1', 'cobranca2', 'cobranca3'].includes(f.fase)).length,
      gradient: 'linear-gradient(135deg,#ef4444,#dc2626)',
      icon: <AlertTriangle size={18} />,
    },
    {
      label: 'Pagos',
      value: filtered.filter((f) => f.fase === 'pago').length,
      gradient: 'linear-gradient(135deg,#10b981,#059669)',
      icon: <CheckCircle size={18} />,
    },
  ]

  const faseOptions: Array<{ id: CobrancaFase | 'todos'; label: string; cor: string }> = [
    { id: 'todos', label: 'Todos', cor: 'bg-slate-100 dark:bg-slate-800' },
    { id: 'pendente', label: 'Pendente', cor: 'bg-slate-100 dark:bg-slate-800' },
    { id: 'notificacao', label: 'Notificação', cor: 'bg-blue-100 dark:bg-blue-950/40' },
    { id: 'cobranca1', label: '1ª Cobrança', cor: 'bg-amber-100 dark:bg-amber-950/40' },
    { id: 'cobranca2', label: '2ª Cobrança', cor: 'bg-orange-100 dark:bg-orange-950/40' },
    { id: 'cobranca3', label: '3ª Cobrança', cor: 'bg-red-100 dark:bg-red-950/40' },
    { id: 'judicial', label: 'Ação Judicial', cor: 'bg-red-200 dark:bg-red-900/50' },
    { id: 'pago', label: 'Pago', cor: 'bg-green-100 dark:bg-green-950/40' },
    { id: 'cancelado', label: 'Cancelado', cor: 'bg-gray-100 dark:bg-gray-800' },
  ]

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
      <TopBar
        icon={TrendingUp}
        title="Gestão de Cobrança"
        subtitle="Acompanhe o fluxo de cobrança de honorários com controle de fases"
        actions={<Button>Novo Fluxo</Button>}
      />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.08} />
          ))}
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
                placeholder="Buscar por descrição..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-950 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {faseOptions.map((fase) => (
                <motion.button
                  key={fase.id}
                  onClick={() => setFiltroFase(fase.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filtroFase === fase.id
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : `${fase.cor} text-gray-700 dark:text-gray-300 hover:ring-2 hover:ring-indigo-400`
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {fase.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Lista de Fluxos */}
        {isLoading ? (
          <DataCard delay={0.3}>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          </DataCard>
        ) : filtered.length === 0 ? (
          <DataCard delay={0.3}>
            <EmptyState
              message="Nenhum fluxo de cobrança encontrado"
              icon={<TrendingUp size={28} className="text-gray-300" />}
            />
          </DataCard>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((fluxo, idx) => (
                <motion.div
                  key={fluxo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <CobrancaFluxoComponent
                    fluxo={fluxo}
                    onFaseChange={(novaFase) => {
                      console.log(`Fluxo ${fluxo.id} mudou para fase: ${novaFase}`)
                      // Aqui seria feita a chamada ao backend para atualizar
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
