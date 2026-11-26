import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Briefcase, Bell, Calendar, Gavel, DollarSign, FileText, Users, Sparkles, Settings, Shield, ChevronRight, TrendingUp, X, ClipboardList, UserRoundCog, Landmark, FileBadge2, FileSearch, KeyRound, Bot, Store, LayoutDashboard, Coins } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logotipo_kealex.png'
import { ProfileAvatar } from './ProfileAvatar'
import { useAIPolicy } from '../hooks/useAIPolicy'

const officeLinks = [
  { to: '/clientes', label: 'Clientes & CRM', icon: Users },
  { to: '/processos', label: 'Processos & Fases', icon: Briefcase },
  { to: '/atividades', label: 'Minhas Atividades', icon: ClipboardList },
  { to: '/intimacoes', label: 'Intimações & DJE', icon: Bell, badge: 'Novo' },
  { to: '/prazos', label: 'Calendário de Prazos', icon: Calendar },
  { to: '/audiencias', label: 'Audiências', icon: Gavel, badge: 'Novo' },
  { to: '/financeiro', label: 'Gestão Financeira', icon: DollarSign },
  { to: '/cobranca', label: 'Gestão de Cobrança', icon: TrendingUp, badge: 'Novo' },
  { to: '/documentos', label: 'Modelos e Peças', icon: FileText },
]
const clientLinks = [
  { to: '/processos', label: 'Meus Processos', icon: Briefcase },
  { to: '/prazos', label: 'Prazos', icon: Calendar },
  { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/documentos', label: 'Documentos', icon: FileText },
  { to: '/lgpd', label: 'LGPD & Privacidade', icon: Shield },
]
const escritorioLinks = [
  ...officeLinks,
  { to: '/equipe', label: 'Equipe de Advogados', icon: UserRoundCog },
]

interface Props { collapsed: boolean; mobileOpen: boolean; onClose: () => void; onToggle: () => void }

function NavItem({ to, label, icon: Icon, badge, collapsed, onNavigate }: { to: string; label: string; icon: LucideIcon; badge?: string; collapsed: boolean; onNavigate: () => void }) {
  const location = useLocation()
  const active = location.pathname === to || (to === '/kea-store' && location.pathname.startsWith('/kea-store/') && !location.pathname.startsWith('/kea-store/certidoes')) || (to === '/kea-store/certidoes' && location.pathname.startsWith('/kea-store/certidoes')) || (to === '/admin' && location.pathname === '/admin')
  return (
    <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
      <NavLink to={to} onClick={onNavigate} title={collapsed ? label : undefined} aria-label={label} aria-current={active ? 'page' : undefined} className={`kea-nav-item${active ? ' is-active' : ''}`}>
        <Icon size={19} aria-hidden="true" />
        {!collapsed && <span className="kea-nav-label">{label}</span>}
        {!collapsed && badge && !active && <span className="kea-nav-badge">{badge}</span>}
        {!collapsed && active && <ChevronRight size={15} className="kea-nav-chevron" />}
      </NavLink>
    </motion.div>
  )
}

export function Sidebar({ collapsed, mobileOpen, onClose, onToggle }: Props) {
  const { user } = useAuth()
  const { data: aiPolicy } = useAIPolicy()
  const isAdmin = user?.role === 'admin'
  const isClient = user?.role === 'cliente'
  const isEscritorio = user?.role === 'escritorio'
  const isCollapsed = collapsed && !mobileOpen
  const links = isEscritorio ? escritorioLinks : isClient ? clientLinks : officeLinks
  const nav = (items: typeof officeLinks) => items.filter(({ to }) => (to === '/processos' && user?.role === 'advogado') || !aiPolicy || aiPolicy.allowed_menus.includes(to)).map(({ to, label, icon, badge }) => <NavItem key={to} to={to} label={label} icon={icon} badge={badge} collapsed={isCollapsed} onNavigate={onClose} />)
  const aiMenuAllowed = (path: string) => !aiPolicy || aiPolicy.allowed_menus.includes(path)

  return (
    <>
      <button type="button" className={`kea-sidebar-scrim${mobileOpen ? ' is-visible' : ''}`} onClick={onClose} aria-label="Fechar menu" tabIndex={mobileOpen ? 0 : -1} />
      <aside className={`kea-sidebar${isCollapsed ? ' is-collapsed' : ''}${mobileOpen ? ' is-mobile-open' : ''}`} aria-label="Navegação principal">
        <div className="kea-sidebar-brand">
          <Link to="/processos" onClick={onClose} aria-label="KEALEX — página inicial"><img src={logo} alt="KEALEX" /></Link>
          <button type="button" className="kea-sidebar-toggle" onClick={mobileOpen ? onClose : onToggle} aria-label={mobileOpen ? 'Fechar menu' : collapsed ? 'Expandir menu' : 'Recolher menu'} title={mobileOpen ? 'Fechar menu' : collapsed ? 'Expandir menu' : 'Recolher menu'}>
            {mobileOpen ? <X size={18} /> : <ChevronRight size={18} className={collapsed ? '' : 'is-rotated'} />}
          </button>
        </div>
        <nav className="kea-sidebar-nav">
          {!isCollapsed && <p className="kea-nav-section">{isClient ? 'Minha área' : 'Escritório'}</p>}
          {nav(links)}
          {!isClient && <>
            {!isCollapsed && <p className="kea-nav-section kea-nav-section-separated">Ecossistema</p>}
            {aiMenuAllowed('/integracao-orgaos') && <NavItem to="/integracao-orgaos" label="Integração com Órgãos" icon={Landmark} collapsed={isCollapsed} onNavigate={onClose} />}
            <NavItem to="/kea-store/certidoes" label="Emissões de Certidões" icon={FileBadge2} collapsed={isCollapsed} onNavigate={onClose} />
            <NavItem to="/acompanhar-processo" label="Acompanhar Processo" icon={FileSearch} collapsed={isCollapsed} onNavigate={onClose} />
            {user?.role === 'advogado' && aiMenuAllowed('/analise-documentos') && <NavItem to="/analise-documentos" label="Análise de Documentos" icon={FileSearch} collapsed={isCollapsed} onNavigate={onClose} />}
            <NavItem to="/kea-store" label="Kea Store" icon={Store} collapsed={isCollapsed} onNavigate={onClose} />
          </>}
          {!isClient && isAdmin && !isCollapsed && <p className="kea-nav-section kea-nav-section-separated">Administração</p>}
          {!isClient && isAdmin && !isCollapsed && <p className="kea-nav-section kea-nav-section-separated">Gestão</p>}
          {isAdmin && <NavItem to="/gestao/dashboard" label="Dashboard" icon={LayoutDashboard} collapsed={isCollapsed} onNavigate={onClose} />}
          {isAdmin && <NavItem to="/gestao/creditos" label="Gestão de créditos" icon={Coins} collapsed={isCollapsed} onNavigate={onClose} />}
          {isAdmin && <NavItem to="/admin" label="Configurações" icon={Settings} collapsed={isCollapsed} onNavigate={onClose} />}
          {!isCollapsed && <p className="kea-nav-section kea-nav-section-separated">Inteligência</p>}
          {aiMenuAllowed('/configuracoes/ia') && <NavItem to="/configuracoes/ia" label="Minhas chaves de IA" icon={KeyRound} collapsed={isCollapsed} onNavigate={onClose} />}
          {aiMenuAllowed('/ia') && <NavItem to="/ia" label="Kealex AI Hub" icon={Sparkles} badge="IA" collapsed={isCollapsed} onNavigate={onClose} />}
          {user?.role === 'advogado' && aiMenuAllowed('/meus-agents') && <NavItem to="/meus-agents" label="Meus Agents" icon={Bot} collapsed={isCollapsed} onNavigate={onClose} />}
        </nav>
        {user?.role !== 'escritorio' && <div className="kea-sidebar-user" title={isCollapsed ? user?.nome : undefined}>
          <ProfileAvatar user={user} className="kea-sidebar-avatar" iconSize={17} />
          {!isCollapsed && <div className="kea-sidebar-user-info"><strong>{user?.nome}</strong><span>{user?.role === 'admin' ? 'Administrador' : user?.role}</span></div>}
        </div>}
      </aside>
    </>
  )
}
