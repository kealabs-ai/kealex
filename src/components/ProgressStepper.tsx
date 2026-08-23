import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export interface Step {
  label: string
  icon: React.ReactNode
}

interface ProgressStepperProps {
  steps: Step[]
  current: number
}

export function ProgressStepper({ steps, current }: ProgressStepperProps) {
  return (
    <div className="flex items-start w-full">
      {steps.map((step, idx) => {
        const isCompleted = idx < current
        const isActive = idx === current
        const isLast = idx === steps.length - 1

        return (
          <div key={step.label} className="flex items-start flex-1 min-w-0">
            {/* Step */}
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <span className="absolute w-8 h-8 rounded-full bg-indigo-500 opacity-20 animate-ping" />
                )}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : isActive
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/40'
                      : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check size={13} strokeWidth={3} /> : step.icon}
                </motion.div>
              </div>
              <span className={`mt-1.5 text-[10px] font-medium text-center leading-tight max-w-[60px] ${
                isCompleted
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-gray-400 dark:text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div className="flex-1 h-0.5 mt-4 mx-1 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden self-start">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5, delay: idx * 0.06 }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
