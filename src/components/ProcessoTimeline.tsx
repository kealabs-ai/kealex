import { motion } from 'framer-motion'
import { Check, ChevronRight, Loader } from 'lucide-react'
import type { FaseProcesso, FaseProcessoStatus } from '../types'

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
  isLoading?: boolean
}

export function ProcessoTimeline({ fases, faseAtual = 0, onAvancar, readonly, isLoading }: ProcessoTimelineProps) {
  // Se fases foi fornecido e tem items, usa ele; senão usa DEFAULT_FASES
  const baseFases = fases && fases.length > 0 ? fases : DEFAULT_FASES.map((f, i) => ({
    ...f,
    id: String(i),
  } as FaseProcesso))
  
  const items = baseFases.map((f, i) => {
    // Usar status do backend se disponível, senão calcular baseado em faseAtual
    let status: FaseProcessoStatus = f.status as FaseProcessoStatus
    
    if (!f.status || f.status === 'futura') {
      if (i < faseAtual) status = 'concluida'
      else if (i === faseAtual) status = 'ativa'
      else status = 'futura'
    }
    
    return {
      ...f,
      id: f.id || String(i),
      status,
    }
  })

  // Encontrar índice da fase ativa
  const faseAtivaIndex = items.findIndex(f => f.status === 'ativa')
  const displayFaseAtual = faseAtivaIndex >= 0 ? faseAtivaIndex : faseAtual

  const podeAvancar = !readonly && !isLoading && displayFaseAtual < items.length - 1

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Esteira Processual
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            Fase {displayFaseAtual + 1} de {items.length}: <span className="text-indigo-600 dark:text-indigo-400">{items[displayFaseAtual]?.label}</span>
          </p>
        </div>
        {podeAvancar && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAvancar?.(displayFaseAtual + 1)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all duration-300 disabled:cursor-not-allowed"
          >
            Avançar Fase <ChevronRight size={13} />
          </motion.button>
        )}
        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl">
            <Loader size={13} className="animate-spin" />
            Atualizando...
          </div>
        )}
      </div>

      {/* Timeline horizontal scrollable */}
      <div className={`flex items-center gap-0 overflow-x-auto pb-2 transition-opacity duration-300 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
        {items.map((fase, i) => (
          <div key={fase.id} className="flex items-center shrink-0">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative flex items-center justify-center">
                {fase.status === 'ativa' && !isLoading && (
                  <span className="absolute w-7 h-7 rounded-full bg-indigo-500 opacity-30 animate-ping" />
                )}
                <motion.div
                  key={`${fase.id}-${faseAtual}`}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className={`relative w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    fase.status === 'concluida'
                      ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30'
                      : fase.status === 'ativa'
                      ? 'bg-indigo-600 border-indigo-400 shadow-md shadow-indigo-500/40'
                      : 'bg-slate-200 border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  {fase.status === 'concluida' ? (
                    <Check size={12} className="text-white" strokeWidth={3} />
                  ) : fase.status === 'ativa' ? (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                  )}
                </motion.div>
              </div>
              <span
                className={`text-[10px] font-medium text-center max-w-[64px] leading-tight ${
                  fase.status === 'concluida'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : fase.status === 'ativa'
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {fase.label}
              </span>
            </div>

            {/* Connector */}
            {i < items.length - 1 && (
              <motion.div
                key={`connector-${i}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5 }}
                className={`h-0.5 w-8 mx-1 mb-5 rounded-full transition-all duration-500 origin-left ${
                  i < displayFaseAtual ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
