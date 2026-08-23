import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import logo from '../../assets/logotipo_kealex.jpg'

const NAV = [
  { label: 'Recursos', href: 'recursos' },
  { label: 'Kealex AI', href: 'kealex-ai' },
  { label: 'Benefícios', href: 'beneficios' },
  { label: 'ROI', href: 'roi' },
  { label: 'Preços', href: 'precos' },
  { label: 'FAQ', href: 'faq' },
]

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 72
  window.scrollTo({ top, behavior: 'smooth' })
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      // highlight nav item based on scroll position
      const ids = NAV.map((n) => n.href)
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (el && el.getBoundingClientRect().top <= 100) {
          setActive(ids[i])
          return
        }
      }
      setActive('')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Kealex" className="h-8 w-auto object-contain" />
          </a>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                className={`text-sm font-medium transition-colors relative pb-0.5 ${
                  active === item.href
                    ? 'text-[#00C2A8]'
                    : 'text-slate-600 hover:text-[#081B33]'
                }`}
              >
                {item.label}
                {active === item.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#00C2A8] rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* CTAs desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/entrar"
              className="text-sm font-semibold text-[#081B33] hover:text-[#00C2A8] transition-colors px-4 py-2"
            >
              Entrar
            </Link>
            <a
              href="#trial"
              onClick={(e) => { e.preventDefault(); scrollTo('trial') }}
              className="text-sm font-semibold bg-[#F96313] hover:bg-[#e0550f] text-white px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-orange-200"
            >
              Testar 14 Dias Grátis
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={`#${item.href}`}
                  onClick={(e) => { e.preventDefault(); scrollTo(item.href); setMobileOpen(false) }}
                  className={`block py-2.5 text-sm font-medium transition-colors ${
                    active === item.href ? 'text-[#00C2A8]' : 'text-slate-700 hover:text-[#00C2A8]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 flex flex-col gap-2 border-t border-slate-100 mt-2">
                <Link to="/entrar" className="text-center py-2.5 text-sm font-semibold text-[#081B33] border border-slate-200 rounded-xl">
                  Entrar na Plataforma
                </Link>
                <a href="#trial" onClick={(e) => { e.preventDefault(); scrollTo('trial'); setMobileOpen(false) }} className="text-center py-2.5 text-sm font-semibold bg-[#F96313] text-white rounded-xl">
                  Testar 14 Dias Grátis
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
