import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, X } from 'lucide-react'

export function TrialSection() {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '', perfil: 'advogado' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setDone(true)
  }

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
              14 dias grátis, sem cartão de crédito. Configure em minutos e veja a diferença no primeiro dia.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 bg-[#F96313] hover:bg-[#e0550f] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-xl shadow-orange-900/30 text-base"
            >
              Começar Grátis por 14 Dias <ArrowRight size={18} />
            </button>
            <p className="text-xs text-slate-500 mt-4">Sem cartão · Cancele quando quiser · 100% LGPD</p>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {!done ? (
                <>
                  <div className="bg-[#081B33] px-7 py-5 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Começar Trial Gratuito</h3>
                      <p className="text-xs text-slate-400 mt-0.5">14 dias grátis · Sem cartão de crédito</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white mt-0.5">
                      <X size={18} />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-7 space-y-4">
                    {[
                      { label: 'Nome completo', key: 'nome', type: 'text', placeholder: 'Dr. Rafael Mendes' },
                      { label: 'E-mail profissional', key: 'email', type: 'email', placeholder: 'rafael@escritorio.com.br' },
                      { label: 'WhatsApp', key: 'whatsapp', type: 'tel', placeholder: '(11) 99999-9999' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                        <input
                          type={f.type}
                          placeholder={f.placeholder}
                          required
                          value={(form as any)[f.key]}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Perfil</label>
                      <select
                        value={form.perfil}
                        onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00C2A8] transition-all bg-white"
                      >
                        <option value="advogado">Advogado Autônomo</option>
                        <option value="escritorio">Escritório de Advocacia</option>
                        <option value="corporativo">Departamento Jurídico</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3 rounded-xl transition-all mt-2 flex items-center justify-center gap-2"
                    >
                      Criar Conta Grátis <ArrowRight size={16} />
                    </button>
                    <p className="text-xs text-slate-400 text-center">
                      Ao continuar, você concorda com os Termos de Uso e Política de Privacidade (LGPD).
                    </p>
                  </form>
                </>
              ) : (
                <div className="p-10 text-center">
                  <CheckCircle2 size={48} className="text-[#00C2A8] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#081B33] mb-2">Tudo certo, {form.nome.split(' ')[0]}!</h3>
                  <p className="text-sm text-[#596B82] mb-6">
                    Enviamos as instruções de acesso para <strong>{form.email}</strong>. Seu trial de 14 dias começa agora.
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="bg-[#081B33] text-white font-bold px-6 py-2.5 rounded-xl text-sm"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
