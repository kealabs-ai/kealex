import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Briefcase, Bell, Calendar, Gavel, DollarSign, FileText,
  Users, Sparkles, Settings, Cloud, Database, Bot, Shield,
  Scale, Sun, Moon, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const advogadoLinks: Array<{ to: string; label: string; icon: any; badge?: string }> = [
  { to: '/processos', label: 'Processos & Fases', icon: Briefcase },
  { to: '/intimacoes', label: 'Intimações & DJE', icon: Bell, badge: 'Novo' },
  { to: '/prazos', label: 'Calendário de Prazos', icon: Calendar },
  { to: '/audiencias', label: 'Audiências', icon: Gavel, badge: 'Novo' },
  { to: '/financeiro', label: 'Gestão Financeira', icon: DollarSign },
  { to: '/documentos', label: 'Modelos e Peças', icon: FileText },
  { to: '/clientes', label: 'Clientes & CRM', icon: Users },
]

const clienteLinks: Array<{ to: string; label: string; icon: any; badge?: string }> = [
  { to: '/processos', label: 'Meus Processos', icon: Briefcase },
  { to: '/prazos', label: 'Prazos', icon: Calendar },
  { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/documentos', label: 'Documentos', icon: FileText },
]

const adminLinks: Array<{ to: string; label: string; icon: any; badge?: string }> = [
  { to: '/admin?tab=geral', label: 'Geral', icon: Settings },
  { to: '/admin?tab=cdn', label: 'CDN & Arquivos', icon: Cloud },
  { to: '/admin?tab=database', label: 'Banco de Dados', icon: Database },
  { to: '/admin?tab=ia', label: 'Config. IA', icon: Settings },
  { to: '/admin?tab=agentes', label: 'Agentes IA', icon: Bot },
  { to: '/admin?tab=debug', label: 'Debug API', icon: Bot },
  { to: '/admin?tab=usuarios', label: 'Usuários', icon: Users },
  { to: '/admin?tab=seguranca', label: 'Segurança', icon: Shield },
]

function NavItem({
  to, label, icon: Icon, badge, delay = 0, exact = false,
}: {
  to: string; label: string; icon: any; badge?: string; delay?: number; exact?: boolean
}) {
  const location = useLocation()
  const isAdminTab = to.includes('?tab=')
  const tab = isAdminTab ? to.split('?tab=')[1] : null
  const isActive = isAdminTab
    ? location.pathname === '/admin' && location.search === `?tab=${tab}`
    : exact
    ? location.pathname === to
    : location.pathname.startsWith(to)

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
      <NavLink
        to={to}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            : 'text-slate-400 dark:text-slate-400 hover:text-white hover:bg-white/8 dark:hover:bg-white/5'
        }`}
      >
        <Icon
          size={16}
          className={`shrink-0 transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}
        />
        <span className="flex-1 truncate">{label}</span>
        {badge && !isActive && (
          <span className="text-[9px] font-bold bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-full shrink-0">
            {badge}
          </span>
        )}
        {isActive && <ChevronRight size={12} className="shrink-0 opacity-60" />}
      </NavLink>
    </motion.div>
  )
}

export function Sidebar() {
  const { user } = useAuth()
  const { toggle, isDark } = useTheme()
  const isAdmin = user?.role === 'admin'
  const isCliente = user?.role === 'cliente'
  const links = isAdmin ? [] : isCliente ? clienteLinks : advogadoLinks

  return (
    <aside className="w-64 flex flex-col min-h-screen bg-slate-950 dark:bg-[#070514] border-r border-indigo-950/40 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-indigo-950/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30">
            <Scale size={17} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white">Kealex</span>
            <p className="text-[10px] text-slate-500 -mt-0.5">Plataforma Jurídica</p>
          </div>
          <button
            onClick={toggle}
            className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-300"
            title={isDark ? 'Modo claro' : 'Modo escuro'}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {isAdmin ? (
          <>
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
              Configurações
            </p>
            {adminLinks.map(({ to, label, icon }, i) => (
              <NavItem key={to} to={to} label={label} icon={icon} delay={i * 0.04} />
            ))}
            <div className="my-3 border-t border-indigo-950/40" />
          </>
        ) : (
          <>
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
              {isCliente ? 'Minha Área' : 'Escritório'}
            </p>
            {links.map(({ to, label, icon, badge }, i) => (
              <NavItem key={to} to={to} label={label} icon={icon} badge={badge} delay={i * 0.04} />
            ))}
            <div className="my-3 border-t border-indigo-950/40" />
          </>
        )}

        {/* Kealex AI Hub */}
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
          Inteligência
        </p>
        <NavItem to="/ia" label="Kealex AI Hub" icon={Sparkles} badge="IA" delay={0.3} />
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-indigo-950/40">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.nome?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.nome}</p>
            <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
