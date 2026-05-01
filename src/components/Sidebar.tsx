import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, FileText, Clock, DollarSign, Users, LogOut, Scale, Sparkles, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/processos', label: 'Processos', icon: Briefcase },
  { to: '/documentos', label: 'Documentos', icon: FileText },
  { to: '/prazos', label: 'Prazos', icon: Clock },
  { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/usuarios', label: 'Usuários', icon: Users, roles: ['admin'] },
  { to: '/admin', label: 'Configurações', icon: Settings, roles: ['admin'] },
]

const roleColors: Record<string, string> = {
  admin: 'from-purple-500 to-indigo-500',
  advogado: 'from-blue-500 to-cyan-500',
  cliente: 'from-emerald-500 to-teal-500',
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }
  const visibleLinks = links.filter((l) => !l.roles || l.roles.includes(user?.role ?? ''))
  const initials = user?.nome?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?'

  return (
    <aside className="w-64 flex flex-col min-h-screen bg-gray-950 text-white shrink-0">
      {/* logo */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Scale size={18} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight">Kealex</span>
            <p className="text-[10px] text-gray-500 -mt-0.5">Plataforma Jurídica</p>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-2">Menu</p>
        {visibleLinks.map(({ to, label, icon: Icon }, i) => (
          <motion.div key={to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-white' : 'text-gray-500'} />
                  {label}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}

        {/* divider */}
        <div className="my-3 border-t border-white/5" />
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-2">Inteligência</p>

        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <NavLink
            to="/ia"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Sparkles size={17} className={isActive ? 'text-white' : 'text-purple-400'} />
                Kealex AI
                {!isActive && (
                  <span className="ml-auto text-[9px] font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </>
            )}
          </NavLink>
        </motion.div>
      </nav>

      {/* user */}
      <div className="p-3 m-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[user?.role ?? 'cliente']} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.nome}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Sair">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
