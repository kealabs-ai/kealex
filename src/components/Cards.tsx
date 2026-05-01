import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  trend?: { value: number; label: string }
  gradient: string
  delay?: number
}

export function StatCard({ label, value, icon, trend, gradient, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-5 card-hover cursor-default"
      style={{ background: gradient }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/70 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.value >= 0 ? 'text-white/80' : 'text-red-200'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className="p-2.5 bg-white/20 rounded-xl text-white">{icon}</div>
      </div>
      {/* decorative circle */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
    </motion.div>
  )
}

interface DataCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function DataCard({ children, className = '', delay = 0 }: DataCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      {children}
    </motion.div>
  )
}

export function SkeletonRow() {
  return (
    <tr>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded shimmer" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function EmptyState({ message, icon }: { message: string; icon: ReactNode }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-gray-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="p-4 bg-gray-50 rounded-2xl mb-3">{icon}</div>
      <p className="text-sm">{message}</p>
    </motion.div>
  )
}
