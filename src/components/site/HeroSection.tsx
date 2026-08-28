import { motion } from 'framer-motion'
import { ArrowRight, Play, ShieldCheck, CreditCard } from 'lucide-react'
import heroImg from '../../assets/fundo_home_kealex.jpg'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#F8FAFC] via-white to-[#f0fdf9] overflow-hidden pt-16">
      {/* Mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#00C2A8]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#081B33]/5 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00C2A8" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#00C2A8]/10 border border-[#00C2A8]/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00C2A8] animate-pulse" />
              <span className="text-xs font-semibold text-[#00C2A8] tracking-wide">Inteligência Artificial Jurídica Brasileira 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-[#081B33] leading-tight mb-5">
              Gerencie seu escritório.{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-[#00C2A8] to-[#0891b2] bg-clip-text text-transparent">
                  A IA cuida do resto.
                </span>
                <svg className="absolute -bottom-1 left-0 w-full" height="4" viewBox="0 0 300 4">
                  <path d="M0 2 Q150 0 300 2" stroke="#00C2A8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-base lg:text-lg text-[#596B82] leading-relaxed mb-8 max-w-lg">
              Da distribuição ao trânsito em julgado — controle processos, prazos, cobranças e documentos com IA treinada no CPC, CLT e jurisprudência STF/STJ.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <a
                href="#trial"
                className="inline-flex items-center justify-center gap-2 bg-[#F96313] hover:bg-[#e0550f] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-200 text-sm"
              >
                Começar Grátis por 14 Dias <ArrowRight size={16} />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-[#00C2A8] text-[#081B33] font-semibold px-7 py-3.5 rounded-xl transition-all text-sm"
              >
                <Play size={15} className="text-[#00C2A8]" /> Ver Demonstração
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#596B82]">
              <span className="flex items-center gap-1.5">
                <CreditCard size={13} className="text-[#00C2A8]" /> Sem cartão de crédito
              </span>
              <span className="w-px h-4 bg-slate-200" />
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#00C2A8]" /> 100% LGPD
              </span>
              <span className="w-px h-4 bg-slate-200" />
              <span className="flex items-center gap-1.5">
                <span className="text-[#00C2A8] font-bold">✓</span> Cancele quando quiser
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
            {/* Browser frame */}
            <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-200 overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
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
                alt="Kealex Dashboard"
                className="w-full object-cover object-top"
                style={{ maxHeight: 380 }}
              />
            </div>

            {/* Floating stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-3"
            >
              <p className="text-xs text-slate-500 mb-0.5">Documentos em CDN</p>
              <p className="text-2xl font-extrabold text-[#081B33]">2.4k+</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="absolute -top-4 -right-4 bg-[#00C2A8] rounded-2xl shadow-lg px-4 py-3"
            >
              <p className="text-xs text-white/80 mb-0.5">Produtividade</p>
              <p className="text-2xl font-extrabold text-white">46% +</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
