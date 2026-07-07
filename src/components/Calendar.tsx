import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Prazo } from '../types'

interface CalendarProps {
  prazos: Prazo[]
  onDateSelect?: (date: Date) => void
}

export function Calendar({ prazos, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  const getPrazosForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0]
    return prazos.filter((p) => p.dataVencimento.startsWith(dateStr))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300'
      case 'vencido':
        return 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300'
      case 'pendente':
      default:
        return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
    }
  }

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  const days: (number | null)[] = Array.from({ length: firstDay }, () => null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  return (
    <motion.div
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{monthName}</h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600 dark:text-slate-400" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dayPrazos = day !== null ? getPrazosForDate(day) : []
          const today = isToday(day)

          return (
            <motion.div
              key={idx}
              className={`min-h-24 p-2 rounded-lg border-2 transition-all cursor-pointer ${
                day === null
                  ? 'bg-gray-50 dark:bg-slate-800/30 border-transparent'
                  : today
                    ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800/50'
              }`}
              onClick={() => day !== null && onDateSelect?.(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              whileHover={day !== null ? { scale: 1.02 } : {}}
            >
              {day !== null && (
                <>
                  <div className={`text-sm font-semibold mb-1 ${today ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayPrazos.slice(0, 2).map((p) => (
                      <div
                        key={p.id}
                        className={`text-xs px-1.5 py-0.5 rounded truncate font-medium ${getStatusColor(p.status)}`}
                        title={p.titulo}
                      >
                        {p.titulo}
                      </div>
                    ))}
                    {dayPrazos.length > 2 && (
                      <div className="text-xs px-1.5 py-0.5 text-gray-500 dark:text-slate-400 font-medium">
                        +{dayPrazos.length - 2} mais
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700"></div>
            <span className="text-gray-600 dark:text-slate-400">Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-950/40 border border-green-300 dark:border-green-700"></div>
            <span className="text-gray-600 dark:text-slate-400">Concluído</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-700"></div>
            <span className="text-gray-600 dark:text-slate-400">Vencido</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
