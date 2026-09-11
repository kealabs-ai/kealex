import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { TrialModal } from './TrialModal'

export function TrialSection() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* CTA Banner */}
      <section id="trial" className="py-20 bg-gradient-to-br from-[#081B33] to-[#0f2d4a] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C2A8]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F96313]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-bold text-[#00C2A8] uppercase tracking-widest mb-4">Comece Hoje</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
              Transforme seu escritório agora
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              7 dias grátis, sem cartão de crédito. Configure em minutos e veja a diferença no primeiro dia.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 bg-[#F96313] hover:bg-[#e0550f] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-orange-900/30 text-base"
            >
              Começar Teste Grátis de 7 Dias <ArrowRight size={18} />
            </button>
            <p className="text-xs text-slate-500 mt-3">Sem cartão de crédito · Cancele quando quiser · 100% LGPD</p>
          </motion.div>
        </div>
      </section>

      <TrialModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
