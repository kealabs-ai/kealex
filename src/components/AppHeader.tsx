import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, History, LogOut, Menu, Moon, Search, Sun, UserRound, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useQuery } from '@tanstack/react-query'
import { assinaturaApi, PLANOS_CONFIG } from '../api/assinatura'
import { ProfileAvatar } from './ProfileAvatar'
import { Modal } from './Modal'

const destinations = [
  { to: '/processos', label: 'Processos & Fases', keywords: 'processo casos' },
  { to: '/intimacoes', label: 'Intimações & DJE', keywords: 'intimação diário' },
  { to: '/prazos', label: 'Calendário de Prazos', keywords: 'prazo calendário' },
  { to: '/audiencias', label: 'Audiências', keywords: 'audiência' },
  { to: '/financeiro', label: 'Gestão Financeira', keywords: 'financeiro' },
  { to: '/cobranca', label: 'Gestão de Cobrança', keywords: 'cobrança' },
  { to: '/documentos', label: 'Modelos e Peças', keywords: 'documentos peças' },
  { to: '/clientes', label: 'Clientes & CRM', keywords: 'clientes crm' },
  { to: '/ia', label: 'Kealex AI Hub', keywords: 'inteligência ia' },
  { to: '/admin', label: 'Configurações', keywords: 'admin configurações', admin: true },
]

interface Props { onMenuClick: () => void }

export function AppHeader({ onMenuClick }: Props) {
  const { user } = useAuth()
  const isEscritorioContext = user?.role === 'escritorio' || user?.modalidade === 'escritorio'
  const { logout } = useAuth()
  const { data: billingStatus } = useQuery({
    queryKey: ['billing-status'],
    queryFn: assinaturaApi.billingStatus,
    enabled: Boolean(user && user.role !== 'admin'),
    staleTime: 30_000,
  })
  const contractedPlan = billingStatus?.status === 'active'
    ? PLANOS_CONFIG.find((plan) => plan.id === billingStatus.plano)
    : undefined
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const visibleDestinations = useMemo(() => {
    const available = destinations.filter((item) => (!item.admin || user?.role === 'admin') && (user?.role !== 'cliente' || !['/intimacoes', '/cobranca', '/clientes', '/admin'].includes(item.to)))
    const normalized = query.trim().toLocaleLowerCase('pt-BR')
    return (normalized ? available.filter((item) => `${item.label} ${item.keywords}`.toLocaleLowerCase('pt-BR').includes(normalized)) : available).slice(0, 6)
  }, [query, user?.role])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setFocused(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const selectDestination = (to: string) => {
    navigate(to)
    setQuery('')
    setFocused(false)
    inputRef.current?.blur()
  }

  const handleLogout = () => {
    Object.keys(sessionStorage).filter((key) => key.startsWith('subscription-expiration-notice:')).forEach((key) => sessionStorage.removeItem(key))
    logout()
  }

  return (
    <header className="kea-app-header">
      <button type="button" className="kea-mobile-menu" onClick={onMenuClick} aria-label="Abrir menu"><Menu size={21} /></button>
      <div className="kea-global-search-wrap">
        <Search size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Buscar no sistema..."
          aria-label="Buscar módulos no sistema"
          aria-expanded={focused && visibleDestinations.length > 0}
          aria-controls="kea-search-results"
          onFocus={() => setFocused(true)}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && visibleDestinations[0]) selectDestination(visibleDestinations[0].to)
          }}
        />
        {query && <button type="button" className="kea-search-clear" onClick={() => setQuery('')} aria-label="Limpar busca"><X size={15} /></button>}
        {!query && <kbd>Ctrl + K</kbd>}
        {focused && visibleDestinations.length > 0 && (
          <div className="kea-search-results" id="kea-search-results" role="listbox" aria-label="Módulos">
            {visibleDestinations.map((item) => (
              <button type="button" key={item.to} role="option" aria-selected={location.pathname === item.to} onMouseDown={(event) => event.preventDefault()} onClick={() => selectDestination(item.to)}>
                <Search size={14} /><span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="kea-header-spacer" />
      <div className="flex items-center gap-2 pr-2">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">V. 1.0.0</span>
          {isEscritorioContext && contractedPlan && <span className="rounded-lg bg-[#087E96]/10 px-2.5 py-1 text-xs font-semibold text-[#087E96] dark:bg-[#20B987]/15 dark:text-[#20B987]">Plano {contractedPlan.nome}</span>}
        </div>
        <button
          type="button"
          onClick={() => setReleaseNotesOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#087E96]/30 px-2.5 py-1.5 text-xs font-semibold text-[#087E96] transition-colors hover:bg-[#087E96]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/20 dark:border-[#20B987]/40 dark:text-[#20B987] dark:hover:bg-[#20B987]/10"
        >
          <History size={14} />
          <span className="hidden md:inline">Notas da versão</span>
          <span className="md:hidden">Notas</span>
        </button>
      </div>
      <button type="button" className="kea-header-icon" onClick={toggle} aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'} title={isDark ? 'Tema claro' : 'Tema escuro'}>
        {isDark ? <Sun size={19} /> : <Moon size={19} />}
      </button>
      <div className="kea-header-profile-wrap">
        <button type="button" className="kea-header-user" onClick={() => setUserMenuOpen((open) => !open)} aria-expanded={userMenuOpen} aria-haspopup="menu">
          {!isEscritorioContext && <div className="kea-header-user-text"><strong>{user?.nome}</strong><span>{user?.role === 'admin' ? 'Administrador' : user?.role}</span></div>}
          {isEscritorioContext ? <UserRound size={18} aria-hidden="true" /> : <ProfileAvatar user={user} className="kea-header-avatar" iconSize={18} />}
          <ChevronDown size={15} />
        </button>
        {userMenuOpen && <div className="kea-header-user-menu" role="menu">
          <div className="kea-header-user-summary"><strong>{user?.nome}</strong><span>{user?.email}</span></div>
          <Link to="/perfil" role="menuitem" onClick={() => setUserMenuOpen(false)}><UserRound size={16} />Edição do perfil</Link>
          <button type="button" role="menuitem" onClick={handleLogout}><LogOut size={16} />Sair</button>
        </div>}
      </div>
      {releaseNotesOpen && (
        <Modal
          title="Notas da versão"
          subtitle="Kealex — V. 1.0.0 · 20/10/2026"
          onClose={() => setReleaseNotesOpen(false)}
          size="md"
        >
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Primeira versão estável do Kealex.</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Áreas de processos, clientes, documentos, prazos e atividades.</li>
              <li>Gestão financeira, cobranças, usuários, audiências e intimações.</li>
              <li>Administração, perfil do usuário e recursos de inteligência artificial.</li>
              <li>Timeline processual integrada à seção “Fase atual”, com avanço de fase conforme as permissões do usuário.</li>
              <li>Páginas públicas de apresentação, assinatura, termos de uso e privacidade.</li>
            </ul>
          </div>
        </Modal>
      )}
    </header>
  )
}
