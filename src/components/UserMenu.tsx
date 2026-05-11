import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const roleColors: Record<string, string> = {
  admin: 'from-purple-500 to-indigo-500',
  advogado: 'from-blue-500 to-cyan-500',
  cliente: 'from-emerald-500 to-teal-500',
}

export function UserMenu() {
  const { user, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const initials = user?.nome?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?'

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{user?.nome}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[user?.role ?? 'cliente']} flex items-center justify-center text-sm font-bold text-white shadow-md`}>
          {initials}
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{user?.nome}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              setShowMenu(false)
              logout()
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </motion.div>
      )}
    </div>
  )
}
