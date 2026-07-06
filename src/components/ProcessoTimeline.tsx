import { motion } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'
import type { FaseProcesso } from '../types'

const DEFAULT_FASES: Omit<FaseProcesso, 'id'>[] = [
  { label: 'Distribuição', status: 'futura' },
  { label: 'Citação', status: 'futura' },
  { label: 'Contestação', status: 'futura' },
  { label: 'Instrução', status: 'futura' },
  { label: 'Alegações Finais', status: 'futura' },
  { label: 'Sentença', status: 'futura' },
  { label: 'Recurso', status: 'futura' },
  { label: 'Trânsito em Julgado', status: 'futura' },
]

interface ProcessoTimelineProps {
  fases?: FaseProcesso[]
  faseAtual?: number
  onAvancar?: (novaFase: number) => void
  readonly?: boolean
}

export function ProcessoTimeline({ fases, faseAtual = 0, onAvancar, readonly }: ProcessoTimelineProps) {
  const items = fases ?? DEFAULT_FASES.map((f, i) => ({
    ...f,
    id: String(i),
    status: i < faseAtual ? 'concluida' : i === faseAtual ? 'ativa' : 'futura',
  } as FaseProcesso))

  const podeAvancar = !readonly && faseAtual < items.length - 1

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Esteira Processual
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            Fase {faseAtual + 1} de {items.length}
          </p>
        </div>
        {podeAvancar && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAvancar?.(faseAtual + 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all duration-300"
          >
            Avançar Fase <ChevronRight size={13} />
          </motion.button>
        )}
      </div>

      {/* Timeline horizontal scrollable */}
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {items.map((fase, i) => (
          <div key={fase.id} className="flex items-center shrink-0">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative flex items-center justify-center">
                {fase.status === 'ativa' && (
                  <span className="absolute w-7 h-7 rounded-full bg-indigo-500 opacity-30 animate-ping" />
                )}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className={`relative w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    fase.status === 'concluida'
                      ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30'
                      : fase.status === 'ativa'
                      ? 'bg-indigo-600 border-indigo-400 shadow-md shadow-indigo-500/40'
                      : 'bg-slate-800 border-slate-700 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  {fase.status === 'concluida' ? (
                    <Check size={12} className="text-white" strokeWidth={3} />
                  ) : fase.status === 'ativa' ? (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                </motion.div>
              </div>
              <span
                className={`text-[10px] font-medium text-center max-w-[64px] leading-tight ${
                  fase.status === 'concluida'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : fase.status === 'ativa'
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {fase.label}
              </span>
            </div>

            {/* Connector */}
            {i < items.length - 1 && (
              <div
                className={`h-0.5 w-8 mx-1 mb-5 rounded-full transition-all duration-500 ${
                  i < faseAtual ? 'bg-emerald-500' : 'bg-slate-700 dark:bg-slate-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
