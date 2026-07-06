import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Sparkles, Clock, CheckCircle, Eye, AlertTriangle, RefreshCw, FileText } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { DataCard, EmptyState, StatCard } from '../components/Cards'
import type { Intimacao, StatusIntimacao } from '../types'

// Mock data — substituir por hook real quando API estiver pronta
const MOCK_INTIMACOES: Intimacao[] = [
  {
    id: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    diario: 'DJSP — Diário da Justiça do Estado de São Paulo',
    dataPublicacao: new Date().toISOString(),
    conteudo: 'Fica intimado o advogado Dr. João Silva, OAB/SP 123.456, para apresentar contrarrazões ao recurso de apelação interposto pela parte contrária, no prazo de 15 (quinze) dias úteis, nos autos do processo nº 1001234-56.2024.8.26.0100.',
    resumoIA: 'Prazo de 15 dias úteis para contrarrazões de apelação. Processo nº 1001234-56.2024.8.26.0100. Ação urgente requerida.',
    prazoCalculado: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    processoNumero: '1001234-56.2024.8.26.0100',
    processoTitulo: 'Ação de Indenização por Danos Morais',
    status: 'nova',
  },
  {
    id: '2', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(),
    diario: 'DJe — Diário da Justiça Eletrônico Federal',
    dataPublicacao: new Date(Date.now() - 86400000).toISOString(),
    conteudo: 'Designada audiência de conciliação para o dia 15/02/2025, às 14h00, na 3ª Vara Cível da Comarca de São Paulo, para os autos do processo nº 0009876-54.2024.8.26.0100.',
    resumoIA: 'Audiência de conciliação agendada para 15/02/2025 às 14h. Comparecer obrigatório.',
    prazoCalculado: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    processoNumero: '0009876-54.2024.8.26.0100',
    processoTitulo: 'Ação de Cobrança',
    status: 'lida',
  },
  {
    id: '3', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date().toISOString(),
    diario: 'DJSP — Diário da Justiça do Estado de São Paulo',
    dataPublicacao: new Date(Date.now() - 2 * 86400000).toISOString(),
    conteudo: 'Sentença proferida nos autos em epígrafe. Prazo para interposição de recurso de apelação: 15 dias úteis.',
    resumoIA: 'Sentença proferida. Prazo de 15 dias úteis para apelação. Verificar teor da sentença imediatamente.',
    prazoCalculado: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    processoNumero: '0005432-10.2023.8.26.0100',
    processoTitulo: 'Ação Trabalhista — Rescisão Indireta',
    status: 'respondida',
  },
]

const statusConfig: Record<StatusIntimacao, { label: string; color: string; icon: any }> = {
  nova: { label: 'Nova', color: 'bg-rose-500/15 text-rose-400 border-rose-500/20', icon: AlertTriangle },
  lida: { label: 'Lida', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: Eye },
  respondida: { label: 'Respondida', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: CheckCircle },
  ignorada: { label: 'Ignorada', color: 'bg-slate-500/15 text-slate-400 border-slate-500/20', icon: Eye },
}

function IntimacaoBadge({ status }: { status: StatusIntimacao }) {
  const cfg = statusConfig[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

export function IntimacoesPage() {
  const [search, setSearch] = useState('')
  const [scanning, setScanning] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [intimacoes, setIntimacoes] = useState<Intimacao[]>(MOCK_INTIMACOES)

  const filtered = intimacoes.filter(
    (i) =>
      i.processoTitulo?.toLowerCase().includes(search.toLowerCase()) ||
      i.processoNumero?.toLowerCase().includes(search.toLowerCase()) ||
      i.diario.toLowerCase().includes(search.toLowerCase())
  )

  const novas = intimacoes.filter((i) => i.status === 'nova').length

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => setScanning(false), 2500)
  }

  const markAs = (id: string, status: StatusIntimacao) => {
    setIntimacoes((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
  }

  const stats = [
    { label: 'Total', value: intimacoes.length, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <Bell size={18} /> },
    { label: 'Novas', value: novas, gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)', icon: <AlertTriangle size={18} /> },
    { label: 'Lidas', value: intimacoes.filter((i) => i.status === 'lida').length, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <Eye size={18} /> },
    { label: 'Respondidas', value: intimacoes.filter((i) => i.status === 'respondida').length, gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <CheckCircle size={18} /> },
  ]

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-transparent">
      <TopBar
        icon={Bell}
        title="Intimações & DJE"
        subtitle="Central de triagem de publicações em Diários de Justiça"
        actions={
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-300 disabled:opacity-60"
          >
            <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
            {scanning ? 'Varrendo DJe...' : 'Varrer Diários'}
          </motion.button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07} />)}
        </div>

        {scanning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-indigo-950/50 border border-indigo-500/20 rounded-2xl"
          >
            <div className="flex gap-1">
              {[0, 0.15, 0.3].map((d) => (
                <motion.div
                  key={d}
                  className="w-2 h-2 bg-indigo-400 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                />
              ))}
            </div>
            <p className="text-sm text-indigo-300">
              <span className="font-semibold">Kealex AI</span> está varrendo os Diários de Justiça e interpretando publicações...
            </p>
          </motion.div>
        )}

        <DataCard delay={0.2}>
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-indigo-950/40">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por processo, número ou diário..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border border-slate-200 dark:border-indigo-950/60 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-indigo-950/30">
            {filtered.length === 0 ? (
              <EmptyState message="Nenhuma intimação encontrada" icon={<Bell size={28} className="text-slate-300" />} />
            ) : (
              <AnimatePresence>
                {filtered.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-indigo-950/20 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-xl shrink-0 ${item.status === 'nova' ? 'bg-rose-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <FileText size={15} className={item.status === 'nova' ? 'text-rose-500' : 'text-slate-400'} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono text-indigo-500 dark:text-indigo-400">
                            {item.processoNumero}
                          </span>
                          <IntimacaoBadge status={item.status} />
                          {item.status === 'nova' && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          )}
                        </div>

                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
                          {item.processoTitulo}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {item.diario} • {new Date(item.dataPublicacao).toLocaleDateString('pt-BR')}
                        </p>

                        {/* Resumo IA */}
                        {item.resumoIA && (
                          <div className="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-500/15 rounded-xl mb-2">
                            <Sparkles size={13} className="text-indigo-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                              <span className="font-semibold">IA: </span>{item.resumoIA}
                            </p>
                          </div>
                        )}

                        {item.prazoCalculado && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                            <Clock size={11} />
                            <span>Prazo calculado: <strong>{new Date(item.prazoCalculado).toLocaleDateString('pt-BR')}</strong></span>
                          </div>
                        )}

                        {/* Conteúdo expandível */}
                        <AnimatePresence>
                          {expanded === item.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {item.conteudo}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 rounded-lg transition-all"
                        >
                          {expanded === item.id ? 'Fechar' : 'Ver texto'}
                        </button>
                        {item.status === 'nova' && (
                          <button
                            onClick={() => markAs(item.id, 'lida')}
                            className="px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                          >
                            Marcar lida
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </DataCard>
      </div>
    </div>
  )
}
