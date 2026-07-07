import { motion } from 'framer-motion'
import { Clock, AlertCircle, CheckCircle2, DollarSign, Send, FileText } from 'lucide-react'

export type CobrancaFase = 'pendente' | 'notificacao' | 'cobranca1' | 'cobranca2' | 'cobranca3' | 'judicial' | 'pago' | 'cancelado'

interface CobrancaFluxo {
  id: string
  fase: CobrancaFase
  dataInicio: Date
  dataUltimaAcao?: Date
  proximaAcao?: Date
  descricao: string
  valor: number
}

interface CobrancaFluxoProps {
  fluxo: CobrancaFluxo
  onFaseChange?: (novaFase: CobrancaFase) => void
}

const fases: { id: CobrancaFase; label: string; descricao: string; cor: string; icone: React.ReactNode; duracao: number }[] = [
  {
    id: 'pendente',
    label: 'Pendente',
    descricao: 'Aguardando vencimento',
    cor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    icone: <Clock size={16} />,
    duracao: 0,
  },
  {
    id: 'notificacao',
    label: 'Notificação',
    descricao: 'Primeira notificação enviada',
    cor: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
    icone: <Send size={16} />,
    duracao: 5,
  },
  {
    id: 'cobranca1',
    label: '1ª Cobrança',
    descricao: 'Primeira tentativa de cobrança',
    cor: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    icone: <DollarSign size={16} />,
    duracao: 10,
  },
  {
    id: 'cobranca2',
    label: '2ª Cobrança',
    descricao: 'Segunda tentativa de cobrança',
    cor: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300',
    icone: <DollarSign size={16} />,
    duracao: 10,
  },
  {
    id: 'cobranca3',
    label: '3ª Cobrança',
    descricao: 'Terceira tentativa de cobrança',
    cor: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300',
    icone: <AlertCircle size={16} />,
    duracao: 10,
  },
  {
    id: 'judicial',
    label: 'Ação Judicial',
    descricao: 'Encaminhado para ação judicial',
    cor: 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200',
    icone: <FileText size={16} />,
    duracao: 0,
  },
  {
    id: 'pago',
    label: 'Pago',
    descricao: 'Pagamento recebido',
    cor: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300',
    icone: <CheckCircle2 size={16} />,
    duracao: 0,
  },
  {
    id: 'cancelado',
    label: 'Cancelado',
    descricao: 'Cobrança cancelada',
    cor: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    icone: <AlertCircle size={16} />,
    duracao: 0,
  },
]

export function CobrancaFluxoComponent({ fluxo, onFaseChange }: CobrancaFluxoProps) {
  const faseAtual = fases.find((f) => f.id === fluxo.fase)
  const indexFaseAtual = fases.findIndex((f) => f.id === fluxo.fase)

  const diasRestantes = (data: Date | undefined) => {
    if (!data) return null
    const diff = data.getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const proximaAcaoDias = diasRestantes(fluxo.proximaAcao)

  return (
    <motion.div
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fluxo de Cobrança</h3>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
            {fluxo.descricao}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Valor: <span className="font-semibold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fluxo.valor / 100)}
          </span>
        </p>
      </div>

      {/* Timeline */}
      <div className="relative mb-8">
        {/* Linha de progresso */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-slate-700 rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((indexFaseAtual + 1) / fases.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Fases */}
        <div className="grid grid-cols-4 gap-2 relative z-10">
          {fases.map((fase, idx) => {
            const isAtual = fase.id === fluxo.fase
            const isCompleta = idx < indexFaseAtual

            return (
              <motion.button
                key={fase.id}
                onClick={() => onFaseChange?.(fase.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  isAtual
                    ? 'bg-indigo-100 dark:bg-indigo-950/40 ring-2 ring-indigo-500'
                    : isCompleta
                      ? 'bg-green-100 dark:bg-green-950/40'
                      : 'bg-gray-100 dark:bg-slate-800 opacity-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`p-2 rounded-full ${isAtual ? 'bg-indigo-500 text-white' : isCompleta ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                  {isCompleta ? <CheckCircle2 size={16} /> : fase.icone}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{fase.label}</p>
                  <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-1">{fase.descricao}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Informações da Fase Atual */}
      {faseAtual && (
        <motion.div
          className={`p-4 rounded-lg border-l-4 ${faseAtual.cor}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{faseAtual.icone}</div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">{faseAtual.label}</h4>
              <p className="text-sm mb-2">{faseAtual.descricao}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-600 dark:text-slate-400">Início da fase:</p>
                  <p className="font-medium">{fluxo.dataUltimaAcao ? new Date(fluxo.dataUltimaAcao).toLocaleDateString('pt-BR') : 'Não iniciada'}</p>
                </div>
                {fluxo.proximaAcao && proximaAcaoDias !== null && (
                  <div>
                    <p className="text-gray-600 dark:text-slate-400">Próxima ação:</p>
                    <p className={`font-medium ${proximaAcaoDias <= 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {proximaAcaoDias <= 0 ? 'Hoje' : `${proximaAcaoDias} dias`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Ações Rápidas */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-3 uppercase">Ações Rápidas</p>
        <div className="grid grid-cols-2 gap-2">
          {indexFaseAtual < fases.length - 1 && (
            <motion.button
              onClick={() => onFaseChange?.(fases[indexFaseAtual + 1].id)}
              className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Próxima Fase
            </motion.button>
          )}
          {fluxo.fase !== 'pago' && (
            <motion.button
              onClick={() => onFaseChange?.('pago')}
              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Marcar como Pago
            </motion.button>
          )}
          {fluxo.fase !== 'cancelado' && (
            <motion.button
              onClick={() => onFaseChange?.('cancelado')}
              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
