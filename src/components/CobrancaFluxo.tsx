import { motion } from 'framer-motion'
import { Clock, AlertCircle, CheckCircle2, DollarSign, Ban } from 'lucide-react'
import type { Cobranca } from '../types'

const FASES = [
  { label: 'Pendente', descricao: 'Aguardando processamento', cor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', icone: <Clock size={16} /> },
  { label: 'Aguardando Pagamento', descricao: 'Aguardando confirmação', cor: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300', icone: <DollarSign size={16} /> },
  { label: 'Vencida', descricao: 'Prazo de pagamento vencido', cor: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300', icone: <AlertCircle size={16} /> },
  { label: 'Em Cobrança', descricao: 'Cobrança ativa em andamento', cor: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300', icone: <AlertCircle size={16} /> },
  { label: 'Pago', descricao: 'Pagamento recebido', cor: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300', icone: <CheckCircle2 size={16} /> },
]

const fmt = (c: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)

interface Props {
  cobranca: Cobranca
  onProximaFase?: (id: string) => void
  onMarcarPago?: (id: string) => void
  onCancelar?: (id: string) => void
}

export function CobrancaFluxoComponent({ cobranca, onProximaFase, onMarcarPago, onCancelar }: Props) {
  const faseAtual = FASES[cobranca.faseAtual] ?? FASES[0]
  const isFinalizado = cobranca.status === 'pago' || cobranca.status === 'cancelado'

  return (
    <motion.div
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400">Processo: <span className="font-medium text-gray-900 dark:text-white">{cobranca.processoId}</span></p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{fmt(cobranca.valorCentavos)}</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          cobranca.status === 'pago' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' :
          cobranca.status === 'cancelado' ? 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400' :
          'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
        }`}>
          {cobranca.status === 'cancelado' ? 'Cancelado' : cobranca.faseLabel}
        </span>
      </div>

      {/* Timeline de fases */}
      <div className="relative mb-6">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-slate-700 rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((cobranca.faseAtual + 1) / FASES.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="grid grid-cols-5 gap-1 relative z-10">
          {FASES.map((fase, idx) => {
            const isAtual = idx === cobranca.faseAtual
            const isCompleta = idx < cobranca.faseAtual
            return (
              <div key={fase.label} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                isAtual ? 'bg-indigo-100 dark:bg-indigo-950/40 ring-2 ring-indigo-500' :
                isCompleta ? 'bg-green-100 dark:bg-green-950/40' :
                'bg-gray-100 dark:bg-slate-800 opacity-40'
              }`}>
                <div className={`p-1.5 rounded-full ${isAtual ? 'bg-indigo-500 text-white' : isCompleta ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                  {isCompleta ? <CheckCircle2 size={14} /> : fase.icone}
                </div>
                <p className="text-xs font-medium text-center text-gray-900 dark:text-white leading-tight">{fase.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info fase atual */}
      <div className={`p-3 rounded-lg border-l-4 mb-4 ${faseAtual.cor}`}>
        <div className="flex items-center gap-2">
          {faseAtual.icone}
          <div>
            <p className="text-sm font-semibold">{faseAtual.label}</p>
            <p className="text-xs">{faseAtual.descricao}</p>
          </div>
        </div>
        {cobranca.dataVencimento && (
          <p className="text-xs mt-1 text-gray-600 dark:text-slate-400">
            Vencimento: <span className="font-medium">{new Date(cobranca.dataVencimento).toLocaleDateString('pt-BR')}</span>
          </p>
        )}
        {cobranca.motivoCancelamento && (
          <p className="text-xs mt-1 text-red-600 dark:text-red-400">Motivo: {cobranca.motivoCancelamento}</p>
        )}
      </div>

      {/* Ações */}
      {!isFinalizado && (
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
          {cobranca.faseAtual < FASES.length - 1 && (
            <motion.button
              onClick={() => onProximaFase?.(cobranca.id)}
              className="flex-1 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              Próxima Fase
            </motion.button>
          )}
          <motion.button
            onClick={() => onMarcarPago?.(cobranca.id)}
            className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
            whileTap={{ scale: 0.97 }}
          >
            Marcar Pago
          </motion.button>
          <motion.button
            onClick={() => onCancelar?.(cobranca.id)}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
            whileTap={{ scale: 0.97 }}
          >
            <Ban size={16} />
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
