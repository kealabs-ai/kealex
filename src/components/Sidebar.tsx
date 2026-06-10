import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, FileText, Clock, DollarSign, UserCheck, Scale, Sparkles, Settings, Cloud, Database, Bot, Users, Shield, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const mainLinks = [
  { to: '/processos', label: 'Processos', icon: Briefcase },
  { to: '/documentos', label: 'Documentos', icon: FileText },
  { to: '/prazos', label: 'Prazos', icon: Clock },
  { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/clientes', label: 'Clientes', icon: UserCheck, roles: ['advogado'] },
]

const adminLinks = [
  { to: '/admin?tab=geral', label: 'Geral', icon: Settings },
  { to: '/admin?tab=cdn', label: 'CDN & Arquivos', icon: Cloud },
  { to: '/admin?tab=database', label: 'Banco de Dados', icon: Database },
  { to: '/admin?tab=ia', label: 'Config. IA', icon: Settings },
  { to: '/admin?tab=agentes', label: 'Agentes IA', icon: Bot },
  { to: '/admin?tab=debug', label: '🧪 Debug API', icon: Bot },
  { to: '/admin?tab=usuarios', label: 'Usuários', icon: Users },
  { to: '/admin?tab=seguranca', label: 'Segurança', icon: Shield },
  { to: '/admin?tab=notificacoes', label: 'Notificações', icon: Bell },
]

export function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const isAdmin = user?.role === 'admin'
  const visibleLinks = isAdmin ? [] : mainLinks.filter((l) => !l.roles || l.roles.includes(user?.role ?? ''))

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
        {isAdmin ? (
          <>
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-2">Configurações</p>
            {adminLinks.map(({ to, label, icon: Icon }, i) => {
              const tab = to.split('?tab=')[1]
              const isActive = location.pathname === '/admin' && location.search === `?tab=${tab}`
              return (
                <motion.div key={to} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <NavLink
                    to={to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={17} className={isActive ? 'text-white' : 'text-gray-500'} />
                    {label}
                  </NavLink>
                </motion.div>
              )
            })}
            <div className="my-3 border-t border-white/5" />
          </>
        ) : (
          <>
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
            <div className="my-3 border-t border-white/5" />
          </>
        )}
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


    </aside>
  )
}
