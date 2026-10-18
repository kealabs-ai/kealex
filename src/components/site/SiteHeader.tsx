import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, UserRound, X } from 'lucide-react'
import logo from '../../assets/logotipo_kealex.png'
import { TrialModal } from './TrialModal'
import { scrollToSiteSection } from './navigation'

type NavLink = { label: string; href: string; clearance?: number }

const MENUS = [
  {
    label: 'Soluções',
    links: [{ label: 'Escritórios e profissionais', href: 'solucoes' }],
  },
  {
    label: 'Plataforma',
    links: [
      { label: 'Demonstração', href: 'demonstracao' },
      { label: 'Recursos', href: 'recursos' },
      { label: 'Simule ROI', href: 'roi' },
    ],
  },
]

const INTRO_LINKS: NavLink[] = [
  { label: 'Sobre Nós', href: 'sobre-nos' },
]
const END_LINKS: NavLink[] = [
  { label: 'Benefícios', href: 'beneficios' },
  { label: 'Preços', href: 'precos' },
  { label: 'FAQ', href: 'faq' },
  { label: 'Contato', href: 'contato' },
]
const SECTION_IDS = [...INTRO_LINKS, ...MENUS.flatMap((menu) => menu.links), ...END_LINKS].map((link) => link.href)

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [trialOpen, setTrialOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const uniqueIds = [...new Set(SECTION_IDS)]
    uniqueIds.forEach((id) => {
      const element = document.getElementById(id)
      if (!element) return
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActive(id)
      }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 })
      observer.observe(element)
      observers.push(observer)
    })
    return () => observers.forEach((observer) => observer.disconnect())
  }, [])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
        setMobileOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
        setMobileOpen(false)
        setMobileExpanded(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const goTo = (href: string, clearance?: number) => {
    scrollToSiteSection(href, clearance)
    setOpenMenu(null)
    setMobileOpen(false)
    setMobileExpanded(null)
  }

  return (
    <>
    <header ref={headerRef} className={`fixed inset-x-0 top-0 z-50 border-b transition-shadow duration-300 ${scrolled ? 'border-slate-100 bg-white/95 shadow-sm backdrop-blur-md' : 'border-transparent bg-white'}`}>
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
        <a href="#inicio" onClick={(event) => { event.preventDefault(); goTo('inicio') }} aria-label="Kealex — início" className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F96313]">
          <img src={logo} alt="Kealex" className="h-8 w-auto object-contain" />
        </a>

        <nav aria-label="Navegação principal" className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {INTRO_LINKS.map((link) => <button key={link.href} onClick={() => goTo(link.href)} className={`rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F96313] ${active === link.href ? 'text-[#e65b13]' : 'text-slate-700'}`}>{link.label}</button>)}
          {MENUS.map((menu) => {
            const expanded = openMenu === menu.label
            const menuActive = menu.links.some((link) => link.href === active)
            return <div key={menu.label} className="relative" onMouseEnter={() => setOpenMenu(menu.label)} onMouseLeave={() => setOpenMenu((current) => current === menu.label ? null : current)}>
              <button type="button" aria-expanded={expanded} onClick={() => setOpenMenu(expanded ? null : menu.label)} onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); setOpenMenu(menu.label) } }} className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F96313] ${menuActive || expanded ? 'text-[#e65b13]' : 'text-slate-700'}`}>
                {menu.label}<ChevronDown size={15} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {expanded && <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.16 }} className="absolute left-0 top-full z-[70] min-w-60 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                  {menu.links.map((link: NavLink) => <button key={link.label} onClick={() => goTo(link.href, link.clearance)} className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-orange-50 hover:text-[#e65b13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F96313] ${active === link.href ? 'font-semibold text-[#e65b13]' : 'text-slate-700'}`}>{link.label}</button>)}
                </motion.div>}
              </AnimatePresence>
            </div>
          })}
          {END_LINKS.map((link) => <button key={link.href} onClick={() => goTo(link.href)} className={`rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F96313] ${active === link.href ? 'text-[#e65b13]' : 'text-slate-700'}`}>{link.label}</button>)}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <a href="/entrar" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-[#081B33] transition-colors hover:text-[#e65b13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F96313]"><UserRound size={17} />Entrar</a>
          <button onClick={() => setTrialOpen(true)} className="rounded-xl bg-[#F96313] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e0550f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F96313]">Testar 7 Dias Grátis</button>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <button onClick={() => setTrialOpen(true)} className="rounded-lg bg-[#F96313] px-3 py-2 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F96313]">Teste grátis</button>
          <button type="button" aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileOpen} aria-controls="site-mobile-menu" onClick={() => setMobileOpen((value) => !value)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F96313]">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && <motion.div id="site-mobile-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-slate-100 bg-white shadow-lg xl:hidden">
          <nav aria-label="Navegação móvel" className="mx-auto max-w-3xl px-4 py-3">
            {INTRO_LINKS.map((link) => <button key={link.href} onClick={() => goTo(link.href)} className="block w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50">{link.label}</button>)}
            {MENUS.map((menu) => {
              const expanded = mobileExpanded === menu.label
              return <div key={menu.label} className="border-b border-slate-100 last:border-0">
                <button type="button" aria-expanded={expanded} onClick={() => setMobileExpanded(expanded ? null : menu.label)} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F96313]">{menu.label}<ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>
                {expanded && <div className="pb-2 pl-3">{menu.links.map((link: NavLink) => <button key={link.label} onClick={() => goTo(link.href, link.clearance)} className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F96313] ${active === link.href ? 'font-semibold text-[#e65b13]' : 'text-slate-600'}`}>{link.label}</button>)}</div>}
              </div>
            })}
            {END_LINKS.map((link) => <button key={link.href} onClick={() => goTo(link.href)} className="block w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50">{link.label}</button>)}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <a href="/entrar" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-[#081B33]"><UserRound size={16} />Entrar</a>
              <button onClick={() => { setTrialOpen(true); setMobileOpen(false) }} className="rounded-lg bg-[#F96313] py-2.5 text-sm font-bold text-white">Testar grátis</button>
            </div>
          </nav>
        </motion.div>}
      </AnimatePresence>
    </header>
    <TrialModal open={trialOpen} onClose={() => setTrialOpen(false)} />
    </>
  )
}
