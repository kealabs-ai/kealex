import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, AlertCircle, CheckCircle2, DollarSign, Ban, ChevronDown, User, FileText, Calendar, History } from 'lucide-react'
import type { Cobranca } from '../types'
import type { CobrancaTimeline } from '../api/cobrancas'

export const FASES_COBRANCA = [
  { label: 'Pendente', descricao: 'Aguardando processamento', cor: 'border-slate-400 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300', dot: 'bg-slate-400', icone: <Clock size={14} /> },
  { label: 'Aguardando Pagamento', descricao: 'Aguardando confirmação', cor: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300', dot: 'bg-blue-400', icone: <DollarSign size={14} /> },
  { label: 'Vencida', descricao: 'Prazo de pagamento vencido', cor: 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300', dot: 'bg-amber-400', icone: <AlertCircle size={14} /> },
  { label: 'Em Cobrança', descricao: 'Cobrança ativa em andamento', cor: 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300', dot: 'bg-red-400', icone: <AlertCircle size={14} /> },
  { label: 'Pago', descricao: 'Pagamento recebido com sucesso', cor: 'border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300', dot: 'bg-green-500', icone: <CheckCircle2 size={14} /> },
]

const fmt = (c: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtDateTime = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const ACAO_LABELS: Record<string, string> = {
  criada: 'Cobrança criada',
  fase_avancada: 'Fase avançada',
  marcado_pago: 'Marcado como pago',
  cancelada: 'Cobrança cancelada',
}

interface Props {
  cobranca: Cobranca
  clienteNome?: string
  processoTitulo?: string
  processoNumero?: string
  timeline?: CobrancaTimeline
  onProximaFase?: (id: string) => void
  onMarcarPago?: (id: string) => void
  onCancelar?: (id: string) => void
  onLoadTimeline?: (id: string) => void
}

export function CobrancaFluxoComponent({
  cobranca,
  clienteNome,
  processoTitulo,
  processoNumero,
  timeline,
  onProximaFase,
  onMarcarPago,
  onCancelar,
  onLoadTimeline,
}: Props) {
  const [showTimeline, setShowTimeline] = useState(false)
  const faseAtual = FASES_COBRANCA[cobranca.faseAtual] ?? FASES_COBRANCA[0]
  const isFinalizado = cobranca.status === 'pago' || cobranca.status === 'cancelado'

  const handleToggleTimeline = () => {
    if (!showTimeline && !timeline) onLoadTimeline?.(cobranca.id)
    setShowTimeline((v) => !v)
  }

  return (
    <motion.div
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header com cliente e processo */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User size={13} className="text-indigo-400 shrink-0" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {clienteNome ?? <span className="text-gray-400 dark:text-slate-500 font-normal text-xs">Cliente não vinculado</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={13} className="text-purple-400 shrink-0" />
              <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
                {processoNumero && <span className="font-mono text-indigo-500 dark:text-indigo-400 mr-1">{processoNumero}</span>}
                {processoTitulo ?? <span className="italic">Processo não vinculado</span>}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(cobranca.valorCentavos)}</p>
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 ${
              cobranca.status === 'pago' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' :
              cobranca.status === 'cancelado' ? 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400' :
              'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
            }`}>
              {cobranca.status === 'cancelado' ? 'Cancelado' : faseAtual.label}
            </span>
          </div>
        </div>

        {/* Barra de progresso das fases */}
        <div className="relative mb-1">
          <div className="flex items-center justify-between mb-3">
            {FASES_COBRANCA.map((fase, idx) => {
              const isAtual = idx === cobranca.faseAtual
              const isCompleta = idx < cobranca.faseAtual
              return (
                <div key={fase.label} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    isAtual ? 'border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900' :
                    isCompleta ? 'border-green-500 bg-green-500 text-white' :
                    'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-500'
                  }`}>
                    {isCompleta ? <CheckCircle2 size={13} /> : fase.icone}
                  </div>
                  <span className={`text-[10px] font-medium text-center leading-tight max-w-[56px] ${
                    isAtual ? 'text-indigo-600 dark:text-indigo-400' :
                    isCompleta ? 'text-green-600 dark:text-green-400' :
                    'text-gray-400 dark:text-slate-500'
                  }`}>{fase.label}</span>
                  {/* Linha conectora */}
                  {idx < FASES_COBRANCA.length - 1 && (
                    <div className="absolute" style={{ display: 'none' }} />
                  )}
                </div>
              )
            })}
          </div>
          {/* Linha de progresso */}
          <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-gray-200 dark:bg-slate-700 -z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-green-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(cobranca.faseAtual / (FASES_COBRANCA.length - 1)) * 100}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Info da fase atual */}
        <div className={`mt-4 p-3 rounded-xl border-l-4 ${faseAtual.cor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {faseAtual.icone}
              <div>
                <p className="text-xs font-semibold">{faseAtual.label}</p>
                <p className="text-xs opacity-80">{faseAtual.descricao}</p>
              </div>
            </div>
            <div className="text-right text-xs opacity-70 space-y-0.5">
              {cobranca.dataVencimento && (
                <div className="flex items-center gap-1 justify-end">
                  <Calendar size={11} />
                  <span>Vence {fmtDate(cobranca.dataVencimento)}</span>
                </div>
              )}
              {cobranca.dataPagamento && (
                <div className="flex items-center gap-1 justify-end text-green-600 dark:text-green-400">
                  <CheckCircle2 size={11} />
                  <span>Pago em {fmtDate(cobranca.dataPagamento)}</span>
                </div>
              )}
            </div>
          </div>
          {cobranca.motivoCancelamento && (
            <p className="text-xs mt-1.5 text-red-600 dark:text-red-400">Motivo: {cobranca.motivoCancelamento}</p>
          )}
        </div>

        {/* Ações */}
        {!isFinalizado && (
          <div className="flex gap-2 mt-4">
            {cobranca.faseAtual < FASES_COBRANCA.length - 1 && (
              <motion.button
                onClick={() => onProximaFase?.(cobranca.id)}
                className="flex-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-colors"
                whileTap={{ scale: 0.97 }}
              >
                Próxima Fase →
              </motion.button>
            )}
            <motion.button
              onClick={() => onMarcarPago?.(cobranca.id)}
              className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              ✓ Marcar Pago
            </motion.button>
            <motion.button
              onClick={() => onCancelar?.(cobranca.id)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-xl text-xs transition-colors"
              whileTap={{ scale: 0.97 }}
              title="Cancelar cobrança"
            >
              <Ban size={14} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Botão toggle timeline */}
      <button
        onClick={handleToggleTimeline}
        className="w-full flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-slate-800 text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <History size={13} />
          Histórico da cobrança
          {timeline && <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">{timeline.timeline.length}</span>}
        </span>
        <motion.div animate={{ rotate: showTimeline ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} />
        </motion.div>
      </button>

      {/* Timeline expandida */}
      <AnimatePresence>
        {showTimeline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2">
              {!timeline ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : timeline.timeline.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-4">Nenhum evento registrado</p>
              ) : (
                <div className="relative">
                  <div className="space-y-4">
                    {timeline.timeline.map((evento, idx) => {
                      const fase = evento.fase_nova !== null ? FASES_COBRANCA[evento.fase_nova] : null
                      const isFirst = idx === 0
                      const isLast = idx === timeline.timeline.length - 1
                      return (
                        <motion.div
                          key={evento.id}
                          className="flex gap-3"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          {/* Dot + linha vertical */}
                          <div className="flex flex-col items-center shrink-0">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 shrink-0 ${
                              isFirst ? 'bg-indigo-500' : fase ? fase.dot : 'bg-gray-400'
                            }`} />
                            {!isLast && (
                              <div className="w-px flex-1 mt-1 bg-gray-200 dark:bg-slate-700" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                  {ACAO_LABELS[evento.acao] ?? evento.acao}
                                </p>
                                {evento.fase_anterior !== null && evento.fase_nova !== null && (
                                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                                    {FASES_COBRANCA[evento.fase_anterior]?.label ?? `Fase ${evento.fase_anterior}`}
                                    {' → '}
                                    <span className="font-medium text-indigo-500 dark:text-indigo-400">
                                      {FASES_COBRANCA[evento.fase_nova]?.label ?? `Fase ${evento.fase_nova}`}
                                    </span>
                                  </p>
                                )}
                                {evento.status_novo && !evento.fase_nova && (
                                  <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                                    Status: <span className="font-medium capitalize">{evento.status_novo}</span>
                                  </p>
                                )}
                                {evento.observacao && (
                                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 italic">"{evento.observacao}"</p>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 dark:text-slate-500 shrink-0 whitespace-nowrap">
                                {fmtDateTime(evento.data)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
