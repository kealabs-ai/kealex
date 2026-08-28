import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Star, MessageCircle, Phone } from 'lucide-react'

const PLANS = [
  {
    name: 'Starter',
    monthly: 197,
    desc: 'Para profissionais autônomos e pequenos negócios que precisam sair das planilhas.',
    features: [
      'Até 2 usuários',
      '1.000 ações/requisições por mês',
      'Processos, Prazos e Documentos',
      'Gestão financeira básica',
      'Suporte via e-mail',
    ],
    cta: 'Começar Grátis',
    highlight: false,
    badge: null,
  },
  {
    name: 'Professional',
    monthly: 497,
    desc: 'Para PMEs que querem escalar com IA e integrações sem aumentar o time.',
    features: [
      'Até 10 usuários',
      '5.000 ações/requisições por mês',
      'Todos os módulos + IA integrada',
      'API & Webhooks para integrações',
      'Suporte prioritário via WhatsApp',
      'Onboarding assistido',
    ],
    cta: 'Quero o Professional',
    highlight: true,
    badge: 'Mais Popular',
  },
  {
    name: 'Enterprise',
    monthly: 997,
    desc: 'Para operações robustas que exigem escala, segurança e suporte dedicado.',
    features: [
      'Usuários ilimitados',
      'Volume customizado de IA',
      'Onboarding assistido completo',
      'Gerente de conta dedicado',
      'SLA contratual garantido',
      'Infraestrutura dedicada',
    ],
    cta: 'Falar com Especialista',
    highlight: false,
    badge: null,
    isEnterprise: true,
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  const price = (monthly: number) =>
    annual ? Math.round(monthly * 10) : monthly

  return (
    <section id="precos" className="py-20 bg-[#F8FAFC]" aria-label="Planos e preços do Kealex">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold text-[#00C2A8] uppercase tracking-widest mb-3">Planos e Preços</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#081B33] mb-4">
            Invista menos do que um estagiário.
            <br />
            <span className="text-[#00C2A8]">Produza como um time completo.</span>
          </h2>
          <p className="text-[#596B82] mb-7">14 dias grátis em qualquer plano. Sem cartão de crédito.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${!annual ? 'bg-[#081B33] text-white' : 'text-slate-500'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${annual ? 'bg-[#081B33] text-white' : 'text-slate-500'}`}
            >
              Anual
              <span className="text-[10px] bg-[#00C2A8] text-white px-1.5 py-0.5 rounded-full font-bold">-17%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-7 flex flex-col ${
                plan.highlight
                  ? 'bg-[#081B33] text-white shadow-2xl shadow-[#081B33]/20 scale-[1.03] ring-2 ring-[#00C2A8]'
                  : 'bg-white border border-slate-100 shadow-sm'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F96313] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-orange-200">
                  <Star size={11} fill="currentColor" /> {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-[#081B33]'}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs mb-4 leading-relaxed ${plan.highlight ? 'text-slate-400' : 'text-[#596B82]'}`}>
                  {plan.desc}
                </p>
                <div className="flex items-end gap-1">
                  {plan.isEnterprise ? (
                    <>
                      <span className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>A partir de</span>
                      <span className="text-4xl font-extrabold text-[#081B33]">
                        R$ {price(plan.monthly).toLocaleString('pt-BR')}
                      </span>
                      <span className="text-sm mb-1 text-slate-400">/{annual ? 'ano' : 'mês'}</span>
                    </>
                  ) : (
                    <>
                      <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-[#081B33]'}`}>
                        R$ {price(plan.monthly).toLocaleString('pt-BR')}
                      </span>
                      <span className={`text-sm mb-1 ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>
                        /{annual ? 'ano' : 'mês'}
                      </span>
                    </>
                  )}
                </div>
                {annual && !plan.isEnterprise && (
                  <p className="text-xs text-[#00C2A8] mt-1">
                    Equivale a R$ {plan.monthly}/mês — 2 meses grátis
                  </p>
                )}
                {plan.highlight && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#00C2A8]">
                    <Zap size={12} fill="currentColor" />
                    <span>Escolhido por 68% dos novos clientes</span>
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={14} className="shrink-0 mt-0.5 text-[#00C2A8]" />
                    <span className={plan.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.isEnterprise ? 'mailto:contato@kealabs.com.br' : '#trial'}
                className={`block text-center py-3 rounded-xl text-sm font-bold transition-all ${
                  plan.highlight
                    ? 'bg-[#F96313] hover:bg-[#e0550f] text-white shadow-lg shadow-orange-900/30'
                    : plan.isEnterprise
                    ? 'bg-white border-2 border-[#081B33] text-[#081B33] hover:bg-[#081B33] hover:text-white'
                    : 'bg-[#081B33] hover:bg-[#0f2d4a] text-white'
                }`}
              >
                {plan.isEnterprise ? (
                  <span className="flex items-center justify-center gap-2">
                    <Phone size={14} /> {plan.cta}
                  </span>
                ) : plan.highlight ? (
                  <span className="flex items-center justify-center gap-2">
                    <MessageCircle size={14} /> {plan.cta}
                  </span>
                ) : plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Guarantee strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left shadow-sm"
        >
          <span className="text-2xl" aria-hidden="true">🛡️</span>
          <p className="text-sm text-[#596B82]">
            <strong className="text-[#081B33]">Garantia de 14 dias.</strong>{' '}
            Se não gostar, devolvemos 100% do valor pago no primeiro mês. Sem burocracia.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
