import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, Moon, Search, Sun, UserRound, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ProfileAvatar } from './ProfileAvatar'

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
  const { logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
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
      <button type="button" className="kea-header-icon" onClick={toggle} aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'} title={isDark ? 'Tema claro' : 'Tema escuro'}>
        {isDark ? <Sun size={19} /> : <Moon size={19} />}
      </button>
      <div className="kea-header-profile-wrap">
        <button type="button" className="kea-header-user" onClick={() => setUserMenuOpen((open) => !open)} aria-expanded={userMenuOpen} aria-haspopup="menu">
          <div className="kea-header-user-text"><strong>{user?.nome}</strong><span>{user?.role === 'admin' ? 'Administrador' : user?.role}</span></div>
          <ProfileAvatar user={user} className="kea-header-avatar" iconSize={18} />
          <ChevronDown size={15} />
        </button>
        {userMenuOpen && <div className="kea-header-user-menu" role="menu">
          <div className="kea-header-user-summary"><strong>{user?.nome}</strong><span>{user?.email}</span></div>
          <Link to="/perfil" role="menuitem" onClick={() => setUserMenuOpen(false)}><UserRound size={16} />Edição do perfil</Link>
          <button type="button" role="menuitem" onClick={handleLogout}><LogOut size={16} />Sair</button>
        </div>}
      </div>
    </header>
  )
}
