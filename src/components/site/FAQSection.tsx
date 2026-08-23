import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus } from 'lucide-react'

const FAQS = [
  { q: 'Preciso de cartão de crédito para o trial?', a: 'Não. O período de 14 dias é completamente gratuito e não exige cartão de crédito. Você só fornece dados de pagamento se decidir continuar após o trial.' },
  { q: 'A Kealex AI substitui o advogado?', a: 'Não. A Kealex AI é uma ferramenta de apoio que acelera pesquisas, sugere minutas e calcula prazos. A responsabilidade técnica e ética permanece sempre com o advogado.' },
  { q: 'Os dados do escritório estão seguros?', a: 'Sim. A plataforma é 100% em conformidade com a LGPD. Todos os dados são criptografados em trânsito e em repouso, com backups automáticos e controle de acesso por perfil.' },
  { q: 'Posso migrar meus dados de outro sistema?', a: 'Sim. Oferecemos suporte à importação de dados via planilhas CSV e integrações com os principais sistemas jurídicos do mercado. Nos planos Premium e Enterprise, o onboarding é assistido.' },
  { q: 'Quantos usuários posso ter?', a: 'Depende do plano: Solo (1 advogado), Escritório (até 5), Premium (até 20). Clientes vinculados aos processos têm acesso ilimitado ao portal do cliente em todos os planos pagos.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Não há fidelidade. Você pode cancelar a qualquer momento pelo painel de administração. No plano anual, o cancelamento encerra a renovação automática.' },
]

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold text-[#00C2A8] uppercase tracking-widest mb-3">Dúvidas Frequentes</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#081B33]">Perguntas frequentes</h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border border-slate-100 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-semibold text-[#081B33] pr-4">{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }}>
                  <Plus size={18} className="text-[#596B82] shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-sm text-[#596B82] leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
