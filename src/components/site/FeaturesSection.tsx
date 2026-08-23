import { motion } from 'framer-motion'
import { Briefcase, Clock, CreditCard, Bot, FileText, DollarSign, Bell, Users } from 'lucide-react'

const MODULES = [
  {
    icon: Briefcase,
    color: 'bg-indigo-50 text-indigo-600',
    title: 'Gestão de Processos',
    desc: 'Esteira processual com fases customizáveis, histórico auditável e geração de guias TJMG em PDF.',
  },
  {
    icon: Clock,
    color: 'bg-amber-50 text-amber-600',
    title: 'Controle de Prazos',
    desc: 'Alertas automáticos de prazos CPC/CLT com calendário integrado e notificações de vencimento.',
  },
  {
    icon: CreditCard,
    color: 'bg-red-50 text-red-500',
    title: 'Cobrança Inteligente',
    desc: '5 fases automatizadas: Pendente → Aguardando → Vencida → Em Cobrança → Pago, com timeline completa.',
  },
  {
    icon: Bot,
    color: 'bg-[#00C2A8]/10 text-[#00C2A8]',
    title: 'Kealex AI Assistente',
    desc: 'IA treinada no CPC, CLT e jurisprudência STF/STJ. Minutas, prazos e análise de casos em segundos.',
    highlight: true,
  },
  {
    icon: FileText,
    color: 'bg-purple-50 text-purple-600',
    title: 'Gestão de Documentos',
    desc: 'CDN centralizado com upload seguro, organização por processo e controle de acesso por perfil.',
  },
  {
    icon: DollarSign,
    color: 'bg-green-50 text-green-600',
    title: 'Módulo Financeiro',
    desc: 'Dashboard de honorários, faturamento, inadimplência e projeções de receita em tempo real.',
  },
  {
    icon: Bell,
    color: 'bg-orange-50 text-orange-500',
    title: 'Intimações & Audiências',
    desc: 'Registro e acompanhamento de intimações com agenda de audiências e notificações automáticas.',
  },
  {
    icon: Users,
    color: 'bg-slate-100 text-slate-600',
    title: 'Portal do Cliente',
    desc: 'Acesso restrito por perfil para clientes acompanharem seus processos com transparência total.',
  },
]

export function FeaturesSection() {
  return (
    <section id="recursos" className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold text-[#00C2A8] uppercase tracking-widest mb-3">Plataforma Completa</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#081B33] mb-4">
            Tudo que seu escritório precisa
          </h2>
          <p className="text-[#596B82] max-w-xl mx-auto">
            8 módulos integrados em uma única plataforma. Sem integrações complexas, sem dados espalhados.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`relative bg-white rounded-2xl p-6 border transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                mod.highlight
                  ? 'border-[#00C2A8]/40 shadow-md shadow-[#00C2A8]/10'
                  : 'border-slate-100 shadow-sm'
              }`}
            >
              {mod.highlight && (
                <span className="absolute top-4 right-4 text-[10px] font-bold bg-[#00C2A8] text-white px-2 py-0.5 rounded-full">
                  IA
                </span>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${mod.color}`}>
                <mod.icon size={20} />
              </div>
              <h3 className="font-bold text-[#081B33] mb-2 text-sm">{mod.title}</h3>
              <p className="text-xs text-[#596B82] leading-relaxed">{mod.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
