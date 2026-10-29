import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Building2, ChevronDown, History, Loader2, LogOut, Menu, Moon, Search, Sun, UserRound, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { assinaturaApi, PLANOS_CONFIG } from '../api/assinatura'
import { api } from '../api/client'
import { escritoriosApi } from '../api/escritorios'
import type { Escritorio } from '../api/escritorios'
import { ProfileAvatar } from './ProfileAvatar'
import { Modal } from './Modal'
import { useToast } from './Toast'

const destinations = [
  { to: '/processos', label: 'Processos & Fases', keywords: 'processo casos' },
  { to: '/intimacoes', label: 'Intimações & DJE', keywords: 'intimação diário' },
  { to: '/prazos', label: 'Calendário de Prazos', keywords: 'prazo calendário' },
  { to: '/audiencias', label: 'Audiências', keywords: 'audiência' },
  { to: '/financeiro', label: 'Gestão Financeira', keywords: 'financeiro' },
  { to: '/cobranca', label: 'Gestão de Cobrança', keywords: 'cobrança' },
  { to: '/documentos', label: 'Modelos e Peças', keywords: 'documentos peças' },
  { to: '/clientes', label: 'Clientes & CRM', keywords: 'clientes crm' },
  { to: '/integracao-orgaos', label: 'Integração com Órgãos', keywords: 'integração órgãos tribunais justiça consultas' },
  { to: '/ia', label: 'Kealex AI Hub', keywords: 'inteligência ia' },
  { to: '/admin', label: 'Configurações', keywords: 'admin configurações', admin: true },
]

interface Props { onMenuClick: () => void }

export function AppHeader({ onMenuClick }: Props) {
  const { user, updateUser, logout } = useAuth()
  const isEscritorioContext = user?.role === 'escritorio'
  const { data: billingStatus } = useQuery({
    queryKey: ['billing-status'],
    queryFn: assinaturaApi.billingStatus,
    enabled: Boolean(user && user.role !== 'admin'),
    staleTime: 30_000,
  })
  const contractedPlan = billingStatus?.status === 'active'
    ? PLANOS_CONFIG.find((plan) => plan.id === billingStatus.plano)
    : undefined
  const { data: associatedOffice, isError: officeInfoError, isLoading: officeInfoLoading } = useQuery({
    queryKey: ['escritorio-associado', user?.escritorioId],
    queryFn: () => escritoriosApi.get(user!.escritorioId!),
    enabled: user?.role === 'advogado' && Boolean(user.escritorioId),
    staleTime: 60_000,
  })
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false)
  const [associateOfficeOpen, setAssociateOfficeOpen] = useState(false)
  const [associatedOfficeDetailsOpen, setAssociatedOfficeDetailsOpen] = useState(false)
  const [officeCode, setOfficeCode] = useState('')
  const { success, error } = useToast()
  const associationMutation = useMutation({
    mutationFn: async (codigo: string) => {
      const response = await api.post<{ escritorioId: string; codigo: string; escritorioNome?: string }>('/v1/lex/escritorios/associar-codigo', { codigo })
      return response.data
    },
    onSuccess: ({ escritorioId, codigo, escritorioNome }) => {
      updateUser({ escritorioId, codigoEscritorio: codigo, escritorioNome, modalidade: 'escritorio' })
      setAssociateOfficeOpen(false)
      setOfficeCode('')
      success('Associação ao escritório concluída com sucesso.')
    },
    onError: (err: any) => error(err.response?.data?.detail ?? 'Não foi possível associar ao escritório. Confira o código e tente novamente.'),
  })
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
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">V. 1.3.0</span>
          {isEscritorioContext && contractedPlan && <span className="rounded-lg bg-[#087E96]/10 px-2.5 py-1 text-xs font-semibold text-[#087E96] dark:bg-[#20B987]/15 dark:text-[#20B987]">Plano {contractedPlan.nome}</span>}
        </div>
        {user?.role === 'advogado' && user.escritorioId && <button
          type="button"
          onClick={() => setAssociatedOfficeDetailsOpen(true)}
          className="inline-flex max-w-64 items-center gap-1.5 truncate rounded-lg border border-[#087E96]/30 px-2.5 py-1.5 text-xs font-semibold text-[#087E96] transition-colors hover:bg-[#087E96]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/20 dark:border-[#20B987]/40 dark:text-[#20B987] dark:hover:bg-[#20B987]/10"
          title={associatedOffice?.nome ? `Associado a: ${associatedOffice.nome}` : 'Ver informações do escritório associado'}
        ><Building2 size={14} className="shrink-0" /><span className="shrink-0">Associado a:</span><span className="truncate">{associatedOffice?.nome ?? user.escritorioNome ?? (officeInfoLoading ? 'Carregando...' : 'Escritório associado')}</span></button>}
        {user?.role === 'advogado' && !user.escritorioId && <button
          type="button"
          onClick={() => setAssociateOfficeOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#087E96] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#066b80] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/20"
        ><Building2 size={14} /><span className="hidden sm:inline">Associar Escritório</span><span className="sm:hidden">Associar</span></button>}
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
          subtitle="Kealex — V. 1.3.0 · 29/10/2026"
          onClose={() => setReleaseNotesOpen(false)}
          size="md"
        >
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Novos recursos de IA e melhorias no chat.</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Usuários podem cadastrar e gerenciar chaves pessoais de IA, separadas por provedor e modelo; os segredos ficam criptografados no backend.</li>
              <li>Agentes aceitam modelos de OpenAI, Anthropic, Google, Groq, Cerebras e DeepSeek, com validação de compatibilidade e atualização da lista pela chave informada.</li>
              <li>O chat usa o modelo configurado no agente e apresenta uma mensagem específica quando o acesso ao Groq é bloqueado pelo Cloudflare.</li>
              <li>Advogados podem se associar a um escritório com código; o backend valida a capacidade de vagas.</li>
              <li>A topbar mostra o escritório associado e abre seus dados de cadastro e contato.</li>
              <li>Advogados associados mantêm o acesso às telas de advogado; a role Escritório também acessa os módulos de trabalho e equipe.</li>
              <li>Escritórios podem compartilhar o código de associação pela área de equipe.</li>
              <li>Áreas de processos, clientes, documentos, prazos e atividades.</li>
              <li>Gestão financeira, cobranças, usuários, audiências e intimações.</li>
              <li>Administração, perfil do usuário e recursos de inteligência artificial.</li>
              <li>Timeline processual integrada à seção “Fase atual”, com avanço de fase conforme as permissões do usuário.</li>
              <li>Páginas públicas de apresentação, assinatura, termos de uso e privacidade.</li>
              <li>As consultas dos ramos da Justiça usam o banner padronizado, com título e descrição específicos.</li>
              <li>No cadastro de processo, o número CNJ identifica o tribunal e busca dados públicos do processo no DataJud.</li>
              <li>Quando localizado, o processo preenche os campos vazios de classe, vara, tribunal e descrição; campos já editados são preservados.</li>
            </ul>
          </div>
        </Modal>
      )}
      {associateOfficeOpen && <Modal
        title="Associar Escritório"
        subtitle="Informe o código fornecido pelo escritório para solicitar seu vínculo."
        onClose={() => { setAssociateOfficeOpen(false); setOfficeCode(''); associationMutation.reset() }}
        size="sm"
      >
        <form onSubmit={(event) => { event.preventDefault(); associationMutation.mutate(officeCode.trim().toUpperCase()) }} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="association-office-code">Código do escritório
            <input
              id="association-office-code"
              value={officeCode}
              onChange={(event) => setOfficeCode(event.target.value.toUpperCase())}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm uppercase tracking-wider focus:border-[#087E96] focus:outline-none focus:ring-2 focus:ring-[#087E96]/15 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Ex.: KX-4F8Q2M"
              maxLength={16}
              autoComplete="off"
              required
            />
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">A associação depende de uma vaga disponível. Se o escritório atingiu o limite, entre em contato com ele para concluir o vínculo manualmente.</p>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
            <button type="button" onClick={() => { setAssociateOfficeOpen(false); setOfficeCode(''); associationMutation.reset() }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Cancelar</button>
            <button type="submit" disabled={!officeCode.trim() || associationMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-[#087E96] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#066b80] disabled:cursor-not-allowed disabled:opacity-50">
              {associationMutation.isPending && <Loader2 size={15} className="animate-spin" />}Associar
            </button>
          </div>
        </form>
      </Modal>}
      {associatedOfficeDetailsOpen && <Modal
        title={associatedOffice?.nome ?? 'Escritório associado'}
        subtitle="Informações do escritório ao qual sua conta está vinculada."
        onClose={() => setAssociatedOfficeDetailsOpen(false)}
        size="sm"
      >
        {officeInfoLoading && !associatedOffice
          ? <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />Carregando informações do escritório...</p>
          : officeInfoError || !associatedOffice
            ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800" role="status">Não foi possível carregar os dados do escritório agora. Tente novamente em instantes.</p>
            : <OfficeDetails office={associatedOffice} />}
      </Modal>}
    </header>
  )
}

function OfficeDetails({ office }: { office: Escritorio }) {
  const rows = [
    ['CNPJ', office.cnpj],
    ['E-mail', office.email],
    ['Telefone', office.telefone],
    ['Endereço', office.endereco],
    ['Código de associação', office.codigo],
  ].filter((row): row is [string, string] => Boolean(row[1]))

  return <dl className="divide-y divide-slate-100 text-sm dark:divide-slate-700">
    {rows.map(([label, value]) => <div key={label} className="grid grid-cols-[max-content_1fr] gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="font-semibold text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="break-words text-right text-slate-800 dark:text-slate-100">{value}</dd>
    </div>)}
  </dl>
}
