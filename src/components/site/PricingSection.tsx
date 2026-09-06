import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, ArrowRight, Phone, Zap } from 'lucide-react'

const PLANS = [
  {
    id: 'autonomo',
    name: 'Autônomo · Solo',
    monthly: 197,
    annual: 167,
    badge: null,
    highlight: false,
    roi: 'Menos do que o valor de uma consulta por mês para blindar seus prazos e automatizar seu escritório.',
    roiEmoji: '⚖️',
    desc: 'Para advogados recém-formados e autônomos que precisam sair das planilhas e nunca mais perder um prazo.',
    features: [
      'Até 2 usuários',
      'Processos, Prazos e Documentos',
      'Controle de Intimações com IA',
      'Portal do Cliente (link seguro)',
      'Financeiro básico (honorários)',
      'Kealex AI — 200 consultas/mês',
      'Suporte via e-mail',
    ],
    integrations: [
      'DataJud · CNJ',
      'Tribunais Superiores (STF, STJ, TST, TSE, STM)',
      'Justiça Federal',
      'Justiça Estadual',
      'Justiça do Trabalho',
      'Justiça Eleitoral',
      'Justiça Militar',
    ],
    cta: 'Começar Teste Grátis de 7 Dias →',
    ctaStyle: 'bg-[#081B33] hover:bg-[#0f2d4a] text-white',
  },
  {
    id: 'escritorio',
    name: 'Escritório · Crescimento',
    monthly: 397,
    annual: 337,
    badge: 'Mais Popular',
    highlight: true,
    roi: 'Menos do que o custo de um estagiário por mês. Com IA que trabalha 24h, automatiza cobranças e escala seu escritório.',
    roiEmoji: '🚀',
    desc: 'Para escritórios em crescimento que querem escalar sem aumentar o time. IA completa, cobrança automática e relatórios.',
    features: [
      'Até 10 usuários',
      'Todos os módulos do plano Solo',
      'Cobrança automática (Boleto/Pix via Asaas)',
      'Honorários de êxito automatizados',
      'Kealex AI — ilimitado',
      'Relatórios financeiros avançados',
      'Audiências e Intimações integradas',
      'Suporte prioritário via WhatsApp',
      'Onboarding assistido',
    ],
    cta: 'Começar Teste Grátis de 7 Dias →',
    ctaStyle: 'bg-[#F96313] hover:bg-[#e0550f] text-white shadow-lg shadow-orange-200',
  },
  {
    id: 'enterprise',
    name: 'Corporativo',
    monthly: null,
    annual: null,
    badge: null,
    highlight: false,
    roi: 'Solução sob medida para grandes escritórios e departamentos jurídicos com volume e compliance avançado.',
    roiEmoji: '🏛️',
    desc: 'Para operações robustas com múltiplas unidades, volume customizado de IA e SLA contratual garantido.',
    features: [
      'Usuários ilimitados',
      'Volume de IA customizado',
      'Infraestrutura dedicada',
      'Gerente de conta dedicado',
      'SLA contratual garantido',
      'Onboarding completo assistido',
      'Integrações via API & Webhooks',
    ],
    cta: 'Falar com Especialista',
    ctaStyle: 'bg-white border-2 border-[#081B33] text-[#081B33] hover:bg-[#081B33] hover:text-white',
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="precos" className="py-20 bg-[#F8FAFC]" aria-label="Planos e preços do Kealex">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold text-[#00C2A8] uppercase tracking-widest mb-3">Planos e Preços</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#081B33] mb-4">
            Invista menos do que um estagiário.{' '}
            <span className="text-[#00C2A8]">Produza como um time completo.</span>
          </h2>
          <p className="text-[#596B82] mb-7 text-sm">7 dias grátis em qualquer plano. Sem cartão de crédito.</p>

          {/* Toggle mensal/anual */}
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
              <span className="text-[10px] bg-[#00C2A8] text-white px-1.5 py-0.5 rounded-full font-bold">-15%</span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
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
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F96313] text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-orange-200 whitespace-nowrap">
                  <Star size={11} fill="currentColor" /> {plan.badge}
                </span>
              )}

              {/* Nome e desc */}
              <div className="mb-5">
                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-[#081B33]'}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs leading-relaxed mb-4 ${plan.highlight ? 'text-slate-400' : 'text-[#596B82]'}`}>
                  {plan.desc}
                </p>

                {/* Preço */}
                {plan.monthly ? (
                  <div className="flex items-end gap-1.5">
                    <span className={`text-4xl font-extrabold leading-none ${plan.highlight ? 'text-white' : 'text-[#081B33]'}`}>
                      R$ {annual ? plan.annual : plan.monthly}
                    </span>
                    <span className={`text-sm mb-1 ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>/mês</span>
                  </div>
                ) : (
                  <p className={`text-2xl font-extrabold ${plan.highlight ? 'text-white' : 'text-[#081B33]'}`}>
                    Sob consulta
                  </p>
                )}
                {annual && plan.monthly && (
                  <p className="text-xs text-[#00C2A8] mt-1">
                    Cobrado anualmente · 2 meses grátis
                  </p>
                )}

                {/* ROI framing */}
                <div className={`mt-3 rounded-xl px-3 py-2.5 ${plan.highlight ? 'bg-white/10' : 'bg-[#00C2A8]/8 border border-[#00C2A8]/20'}`}>
                  <p className={`text-[11px] leading-relaxed ${plan.highlight ? 'text-slate-300' : 'text-[#596B82]'}`}>
                    <span className="mr-1">{plan.roiEmoji}</span>
                    {plan.roi}
                  </p>
                </div>

                {plan.highlight && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#00C2A8]">
                    <Zap size={12} fill="currentColor" />
                    <span>Escolhido por 68% dos novos clientes</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={14} className="shrink-0 mt-0.5 text-[#00C2A8]" />
                    <span className={plan.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              {'integrations' in plan && plan.integrations && (
                <div className="mb-7 border border-slate-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Integrações DataJud</span>
                    <span className="text-[9px] font-bold bg-[#00C2A8] text-white px-1.5 py-0.5 rounded-full ml-auto">Incluso</span>
                  </div>
                  <ul className="divide-y divide-slate-50">
                    {plan.integrations.map((item) => (
                      <li key={item} className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <div>
                <a
                  href={plan.id === 'enterprise' ? 'mailto:contato@kealabs.com.br' : '#trial'}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all ${plan.ctaStyle}`}
                >
                  {plan.id === 'enterprise' ? (
                    <><Phone size={14} /> {plan.cta}</>
                  ) : (
                    <>{plan.cta} <ArrowRight size={14} /></>
                  )}
                </a>
                {plan.id !== 'enterprise' && (
                  <p className={`text-center text-[11px] mt-2 ${plan.highlight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Sem cartão de crédito · Cancele quando quiser
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Garantia */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left shadow-sm"
        >
          <span className="text-2xl" aria-hidden="true">🛡️</span>
          <p className="text-sm text-[#596B82]">
            <strong className="text-[#081B33]">Garantia de 7 dias.</strong>{' '}
            Se não gostar, devolvemos 100% do valor pago. Sem burocracia, sem perguntas.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
