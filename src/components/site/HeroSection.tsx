import { motion } from 'framer-motion'
import { ArrowRight, Play, ShieldCheck, CreditCard, TrendingUp, Clock, Users } from 'lucide-react'
import heroImg from '../../assets/fundo_home_kealex.jpg'

const SOCIAL_PROOF = [
  { icon: TrendingUp, value: '46%', label: 'mais produtividade' },
  { icon: Clock, value: '3h/dia', label: 'economizadas por advogado' },
  { icon: Users, value: '500+', label: 'escritórios ativos' },
]

export function HeroSection() {
  return (
    <section
      id="inicio"
      aria-label="Software jurídico com IA para escritórios de advocacia"
      className="relative flex items-center bg-gradient-to-br from-[#F8FAFC] via-white to-[#f0fdf9] overflow-hidden pt-16"
    >
      {/* Mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#00C2A8]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#081B33]/5 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00C2A8" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-14 lg:pt-8 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#00C2A8]/10 border border-[#00C2A8]/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00C2A8] animate-pulse" aria-hidden="true" />
              <span className="text-xs font-semibold text-[#00C2A8] tracking-wide">#1 Software Jurídico com IA no Brasil · 2025</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-[#081B33] leading-tight mb-5">
              Seu escritório cresce.{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#00C2A8] to-[#0891b2] bg-clip-text text-transparent">
                  A IA trabalha por você.
                </span>
                <svg className="absolute -bottom-1 left-0 w-full" height="4" viewBox="0 0 300 4" aria-hidden="true">
                  <path d="M0 2 Q150 0 300 2" stroke="#00C2A8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-base lg:text-lg text-[#596B82] leading-relaxed mb-6 max-w-lg">
              Pare de perder prazos, afundar em planilhas e cobrar manualmente. O Kealex centraliza{' '}
              <strong className="text-[#081B33] font-semibold">processos, prazos, cobranças e documentos</strong>{' '}
              com IA treinada no CPC, CLT e jurisprudência STF/STJ — tudo em um só lugar.
            </p>

            {/* Social proof inline */}
            <div className="flex flex-wrap gap-5 mb-8">
              {SOCIAL_PROOF.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#00C2A8]/10 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-[#00C2A8]" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[#081B33] leading-none">{value}</p>
                    <p className="text-[11px] text-[#596B82]">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <a
                href="#trial"
                className="inline-flex items-center justify-center gap-2 bg-[#F96313] hover:bg-[#e0550f] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-200 text-sm"
              >
                Começar Teste Grátis de 7 Dias <ArrowRight size={16} />
              </a>
              <a
                href="#precos"
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-[#00C2A8] text-[#081B33] font-semibold px-7 py-3.5 rounded-xl transition-all text-sm"
              >
                <Play size={15} className="text-[#00C2A8]" /> Ver Planos e Preços
              </a>
            </div>
            <p className="text-xs text-[#596B82] mb-8">
              Sem necessidade de cartão de crédito · Cancele quando quiser
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#596B82]">
              <span className="flex items-center gap-1.5">
                <CreditCard size={13} className="text-[#00C2A8]" /> Sem cartão de crédito
              </span>
              <span className="w-px h-4 bg-slate-200" aria-hidden="true" />
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#00C2A8]" /> 100% LGPD
              </span>
              <span className="w-px h-4 bg-slate-200" aria-hidden="true" />
              <span className="flex items-center gap-1.5">
                <span className="text-[#00C2A8] font-bold" aria-hidden="true">✓</span> Cancele quando quiser
              </span>
            </div>
          </motion.div>

          {/* Right — Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100" aria-hidden="true">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-3 bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-400 font-mono">
                  app.kealex.com.br
                </div>
              </div>
              <img
                src={heroImg}
                alt="Dashboard do Kealex mostrando gestão de processos jurídicos com IA"
                className="w-full object-cover object-top"
                style={{ maxHeight: 380 }}
                loading="eager"
                width={640}
                height={380}
              />
            </div>

            {/* Floating stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-3"
            >
              <p className="text-xs text-slate-500 mb-0.5">Processos monitorados</p>
              <p className="text-2xl font-extrabold text-[#081B33]">12.4k+</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="absolute -top-4 -right-4 bg-[#00C2A8] rounded-2xl shadow-lg px-4 py-3"
            >
              <p className="text-xs text-white/80 mb-0.5">Economia de tempo</p>
              <p className="text-2xl font-extrabold text-white">3h/dia</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
