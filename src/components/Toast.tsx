import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextType>(null!)

const icons = {
  success: <CheckCircle size={16} className="text-emerald-500 shrink-0" />,
  error:   <XCircle size={16} className="text-red-500 shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-500 shrink-0" />,
}

const styles = {
  success: 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800',
  error:   'border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800',
  warning: 'border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800',
}

const textStyles = {
  success: 'text-emerald-800 dark:text-emerald-200',
  error:   'text-red-800 dark:text-red-200',
  warning: 'text-amber-800 dark:text-amber-200',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => remove(id), 4000)
  }, [remove])

  const success = useCallback((m: string) => toast('success', m), [toast])
  const error   = useCallback((m: string) => toast('error', m), [toast])
  const warning = useCallback((m: string) => toast('warning', m), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[260px] max-w-sm ${styles[t.type]}`}
            >
              {icons[t.type]}
              <p className={`text-sm font-medium flex-1 ${textStyles[t.type]}`}>{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                aria-label="Fechar notificação"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
