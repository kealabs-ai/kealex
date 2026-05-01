import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  icon?: ReactNode
  loading?: boolean
}

const variants = {
  primary: 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 shadow-sm shadow-indigo-200',
  secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300',
  danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100',
  ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
}
const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
}

export function Button({ variant = 'primary', size = 'md', icon, loading, children, className = '', ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as any)}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : icon}
      {children}
    </motion.button>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>}
      <input
        className={`w-full border rounded-xl px-3 py-2.5 text-sm transition-all outline-none
          ${error ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>}
      <select
        className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all bg-white ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>}
      <textarea
        className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all resize-none ${className}`}
        {...props}
      />
    </div>
  )
}
