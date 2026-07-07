import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Prazo } from '../types'

interface CalendarProps {
  prazos: Prazo[]
  onDateSelect?: (date: Date) => void
}

export function Calendar({ prazos, onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate())

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
      case 'vencido':
        return <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
      case 'pendente':
      default:
        return <Clock size={16} className="text-amber-600 dark:text-amber-400" />
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500'
      case 'vencido':
        return 'bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500'
      case 'pendente':
      default:
        return 'bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'Concluído'
      case 'vencido':
        return 'Vencido'
      case 'pendente':
      default:
        return 'Pendente'
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

  const selectedDayPrazos = selectedDay ? getPrazosForDate(selectedDay) : []
  const selectedDate = selectedDay ? new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay) : null

  const handleDaySelect = (day: number) => {
    setSelectedDay(day)
    if (selectedDate) {
      onDateSelect?.(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
    }
  }

  return (
    <motion.div
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Mini Calendar */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{monthName}</h3>
          <div className="flex gap-1">
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

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dayPrazos = day !== null ? getPrazosForDate(day) : []
            const today = isToday(day)
            const isSelected = day === selectedDay

            return (
              <motion.button
                key={idx}
                onClick={() => day !== null && handleDaySelect(day)}
                className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center relative group ${
                  day === null
                    ? 'bg-gray-50 dark:bg-slate-800/30 border-transparent cursor-default'
                    : isSelected
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                      : today
                        ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-slate-800/50'
                }`}
                whileHover={day !== null ? { scale: 1.05 } : {}}
                whileTap={day !== null ? { scale: 0.95 } : {}}
              >
                {day !== null && (
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-sm font-semibold ${isSelected || today ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {day}
                    </span>
                    {dayPrazos.length > 0 && (
                      <div className="flex gap-0.5">
                        {dayPrazos.slice(0, 3).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-gray-600 dark:text-slate-400">Pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600 dark:text-slate-400">Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-gray-600 dark:text-slate-400">Vencido</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day View */}
      <div className="p-6">
        {selectedDay && selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {selectedDayPrazos.length} {selectedDayPrazos.length === 1 ? 'prazo' : 'prazos'}
              </h4>
            </div>

            <AnimatePresence mode="popLayout">
              {selectedDayPrazos.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayPrazos.map((prazo, idx) => (
                    <motion.div
                      key={prazo.id}
                      className={`p-4 rounded-lg ${getStatusBg(prazo.status)}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusIcon(prazo.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-semibold text-gray-900 dark:text-white truncate">
                                {prazo.titulo}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mt-1">
                                {prazo.descricao}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                              prazo.status === 'concluido'
                                ? 'bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                                : prazo.status === 'vencido'
                                  ? 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                                  : 'bg-amber-200 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                            }`}>
                              {getStatusLabel(prazo.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Clock size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-2" />
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Nenhum prazo neste dia</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
