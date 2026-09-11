import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'kealex_cookie_consent'

type ConsentState = { analytics: boolean; functional: boolean } | null

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [functional, setFunctional] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) setTimeout(() => setVisible(true), 1200)
  }, [])

  const save = (consent: ConsentState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    setVisible(false)
  }

  const acceptAll = () => save({ analytics: true, functional: true })
  const rejectOptional = () => save({ analytics: false, functional: false })
  const saveCustom = () => save({ analytics, functional })

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Consentimento de cookies"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/60 px-5 py-4"
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#00C2A8]/10 flex items-center justify-center shrink-0">
              <Cookie size={16} className="text-[#00C2A8]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#081B33]">Cookies e Privacidade</p>
              <p className="text-xs text-[#596B82] leading-relaxed mt-0.5">
                Usamos cookies essenciais para o funcionamento da plataforma e, com seu consentimento, cookies analíticos e funcionais para melhorar sua experiência.{' '}
                <Link to="/lgpd" className="text-[#00C2A8] hover:underline font-medium">
                  Política de Privacidade
                </Link>
              </p>
            </div>
            <button
              onClick={rejectOptional}
              aria-label="Fechar e recusar cookies opcionais"
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Detalhes expandíveis */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="bg-slate-50 rounded-xl p-3 space-y-2.5 text-xs text-[#596B82]">
                  {/* Essenciais — sempre ativos */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#081B33]">Essenciais</p>
                      <p>Autenticação e segurança. Não podem ser desativados.</p>
                    </div>
                    <span className="flex items-center gap-1 text-[#00C2A8] font-semibold shrink-0">
                      <ShieldCheck size={13} /> Sempre ativo
                    </span>
                  </div>

                  {/* Analíticos */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#081B33]">Analíticos</p>
                      <p>Dados anonimizados de uso para melhorias (Google Analytics com IP anonimizado).</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={analytics}
                      onClick={() => setAnalytics((v) => !v)}
                      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${analytics ? 'bg-[#00C2A8]' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${analytics ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {/* Funcionais */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#081B33]">Funcionais</p>
                      <p>Preferências de interface como tema e idioma.</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={functional}
                      onClick={() => setFunctional((v) => !v)}
                      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${functional ? 'bg-[#00C2A8]' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${functional ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ações */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={acceptAll}
              className="flex-1 min-w-[120px] py-2 bg-[#00C2A8] hover:bg-[#009e88] text-white text-xs font-bold rounded-xl transition-colors"
            >
              Aceitar todos
            </button>
            {showDetails ? (
              <button
                onClick={saveCustom}
                className="flex-1 min-w-[120px] py-2 border border-[#00C2A8] text-[#00C2A8] hover:bg-[#00C2A8]/8 text-xs font-bold rounded-xl transition-colors"
              >
                Salvar preferências
              </button>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                className="flex-1 min-w-[120px] py-2 border border-slate-200 text-[#596B82] hover:border-[#00C2A8] hover:text-[#00C2A8] text-xs font-bold rounded-xl transition-colors"
              >
                Personalizar
              </button>
            )}
            <button
              onClick={rejectOptional}
              className="flex-1 min-w-[120px] py-2 text-[#596B82] hover:text-[#081B33] text-xs font-medium rounded-xl transition-colors"
            >
              Recusar opcionais
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
