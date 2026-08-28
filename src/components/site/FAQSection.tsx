import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

const FAQS = [
  {
    q: 'Quanto tempo leva para minha equipe começar a usar?',
    a: 'A maioria dos clientes está operacional em menos de 1 hora. O onboarding é guiado e não exige conhecimento técnico. Nos planos Professional e Enterprise, um especialista da Kealabs acompanha a configuração inicial.',
  },
  {
    q: 'Preciso de cartão de crédito para o trial de 14 dias?',
    a: 'Não. O período de 14 dias é completamente gratuito e não exige nenhum dado de pagamento. Você só fornece informações de cobrança se decidir continuar após o trial.',
  },
  {
    q: 'Meus dados e os dos meus clientes estão seguros?',
    a: 'Sim. A plataforma é 100% em conformidade com a LGPD. Todos os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256), com backups automáticos diários e controle de acesso por perfil. Nenhum dado é compartilhado com terceiros.',
  },
  {
    q: 'O Kealex substitui meu sistema atual? Posso migrar meus dados?',
    a: 'Sim. Oferecemos importação via planilhas CSV e integração com os principais sistemas jurídicos do mercado. Nos planos Professional e Enterprise, a migração é assistida por nossa equipe técnica sem custo adicional.',
  },
  {
    q: 'O que são as “ações/requisições” dos planos?',
    a: 'São as operações realizadas pela plataforma: consultas à IA, geração de documentos, notificações automáticas e chamadas de API. O plano Starter inclui 1.000/mês, o Professional 5.000/mês e o Enterprise é customizado conforme o volume da operação.',
  },
  {
    q: 'Posso mudar de plano ou cancelar a qualquer momento?',
    a: 'Sim. Upgrade ou downgrade de plano é instantâneo pelo painel. Não há fidelidade ou multa. No plano anual, o cancelamento encerra a renovação automática e você mantém o acesso até o fim do período pago.',
  },
  {
    q: 'A Kealex AI substitui o trabalho do advogado?',
    a: 'Não. A Kealex AI é uma ferramenta de apoio que acelera pesquisas, sugere minutas e calcula prazos com base no CPC, CLT e jurisprudência STF/STJ. A responsabilidade técnica e ética permanece sempre com o profissional.',
  },
  {
    q: 'Existe suporte em português e em qual horário?',
    a: 'Sim, todo o suporte é em português. O plano Starter tem suporte por e-mail com resposta em até 48h. O Professional tem suporte prioritário via WhatsApp em horário comercial. O Enterprise conta com SLA contratual e canal dedicado.',
  },
]

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-white" aria-label="Perguntas frequentes sobre o Kealex">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold text-[#00C2A8] uppercase tracking-widest mb-3">Dúvidas Frequentes</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#081B33] mb-3">Perguntas frequentes</h2>
          <p className="text-sm text-[#596B82]">Não encontrou sua dúvida?{' '}
            <a href="mailto:contato@kealabs.com.br" className="text-[#00C2A8] font-semibold hover:underline">Fale com a gente</a>.
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="border border-slate-100 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                aria-expanded={open === i}
              >
                <span className="text-sm font-semibold text-[#081B33] pr-4">{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }}>
                  <Plus size={18} className="text-[#596B82] shrink-0" aria-hidden="true" />
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
