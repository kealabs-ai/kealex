import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const PLANS = [
  {
    name: 'Solo',
    monthly: 97,
    desc: 'Para advogados autônomos que precisam de organização básica.',
    features: ['1 advogado', '50 processos ativos', '5 GB de documentos', 'Processos, Prazos e Documentos', '50 consultas Kealex AI/mês', 'Suporte por e-mail (48h)'],
    cta: 'Começar Grátis',
    highlight: false,
  },
  {
    name: 'Escritório',
    monthly: 247,
    desc: 'Para escritórios em crescimento com controle total.',
    features: ['Até 5 advogados', '300 processos ativos', '30 GB de documentos', 'Todos os módulos', '300 consultas Kealex AI/mês', 'Suporte via chat (24h)', 'Portal do cliente', 'Módulo financeiro e cobrança'],
    cta: 'Começar Grátis',
    highlight: true,
    badge: 'Mais Vendido',
  },
  {
    name: 'Premium',
    monthly: 497,
    desc: 'Para escritórios consolidados e departamentos jurídicos.',
    features: ['Até 20 advogados', 'Processos ilimitados', '100 GB de documentos', 'Todos os módulos + Admin', 'Kealex AI ilimitado', 'Suporte prioritário (4h)', 'API de integração', 'SLA 99,9% uptime', 'Onboarding dedicado'],
    cta: 'Começar Grátis',
    highlight: false,
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  const price = (monthly: number) =>
    annual ? Math.round(monthly * 10) : monthly

  return (
    <section id="precos" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold text-[#00C2A8] uppercase tracking-widest mb-3">Planos e Preços</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#081B33] mb-4">
            Simples, transparente e justo
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
                  ? 'bg-[#081B33] text-white shadow-2xl shadow-[#081B33]/20 scale-[1.02]'
                  : 'bg-white border border-slate-100 shadow-sm'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F96313] text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Zap size={11} /> {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-[#081B33]'}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs mb-4 ${plan.highlight ? 'text-slate-400' : 'text-[#596B82]'}`}>
                  {plan.desc}
                </p>
                <div className="flex items-end gap-1">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-[#081B33]'}`}>
                    R$ {price(plan.monthly).toLocaleString('pt-BR')}
                  </span>
                  <span className={`text-sm mb-1 ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>
                    /{annual ? 'ano' : 'mês'}
                  </span>
                </div>
                {annual && (
                  <p className="text-xs text-[#00C2A8] mt-1">
                    Equivale a R$ {plan.monthly}/mês — 2 meses grátis
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={14} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-[#00C2A8]' : 'text-[#00C2A8]'}`} />
                    <span className={plan.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#trial"
                className={`block text-center py-3 rounded-xl text-sm font-bold transition-all ${
                  plan.highlight
                    ? 'bg-[#F96313] hover:bg-[#e0550f] text-white shadow-lg shadow-orange-900/30'
                    : 'bg-[#081B33] hover:bg-[#0f2d4a] text-white'
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Enterprise */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div>
            <p className="font-bold text-[#081B33] mb-1">Enterprise — Sob Consulta</p>
            <p className="text-sm text-[#596B82]">
              Infraestrutura dedicada, integrações customizadas, gerente de conta exclusivo e SLA garantido.
            </p>
          </div>
          <a
            href="mailto:contato@kealabs.com.br"
            className="shrink-0 px-6 py-2.5 border-2 border-[#081B33] text-[#081B33] font-bold rounded-xl text-sm hover:bg-[#081B33] hover:text-white transition-all"
          >
            Falar com Especialista
          </a>
        </motion.div>
      </div>
    </section>
  )
}
