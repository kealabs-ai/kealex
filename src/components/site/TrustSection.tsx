import { motion } from 'framer-motion'
import { ShieldCheck, Lock, Server, Eye, FileCheck, RefreshCw } from 'lucide-react'

const ITEMS = [
  {
    icon: Lock,
    color: 'bg-indigo-50 text-indigo-600',
    title: 'Criptografia de ponta a ponta',
    desc: 'Dados criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Seus processos e documentos são inacessíveis a terceiros.',
  },
  {
    icon: ShieldCheck,
    color: 'bg-[#00C2A8]/10 text-[#00C2A8]',
    title: '100% Adequado à LGPD',
    desc: 'Proteção rigorosa para dados sensíveis de Família e Trabalhista. DPO designado, contratos de processamento e política de retenção.',
  },
  {
    icon: Server,
    color: 'bg-blue-50 text-blue-600',
    title: 'Nuvem blindada com backup diário',
    desc: 'Infraestrutura AWS com redundância multi-zona. Backups automáticos diários com retenção de 90 dias e restore em minutos.',
  },
  {
    icon: Eye,
    color: 'bg-amber-50 text-amber-600',
    title: 'Acesso por perfil e auditoria',
    desc: 'Controle granular de permissões por usuário. Log de auditoria completo de todas as ações — quem acessou, quando e o quê.',
  },
  {
    icon: FileCheck,
    color: 'bg-green-50 text-green-600',
    title: 'Sigilo profissional preservado',
    desc: 'Arquitetura multi-tenant isolada. Dados de um escritório são completamente invisíveis para outros clientes da plataforma.',
  },
  {
    icon: RefreshCw,
    color: 'bg-rose-50 text-rose-500',
    title: 'Uptime 99,9% garantido',
    desc: 'SLA de disponibilidade com monitoramento 24/7. Janelas de manutenção programadas fora do horário comercial.',
  },
]

export function TrustSection() {
  return (
    <section id="seguranca" className="py-20 bg-[#081B33] relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00C2A8]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-900/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-[#00C2A8]/15 border border-[#00C2A8]/30 rounded-full px-5 py-2 mb-5">
            <ShieldCheck size={14} className="text-[#00C2A8]" />
            <span className="text-xs font-bold text-[#00C2A8]">Segurança & Compliance</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            Seus dados processuais protegidos.<br />
            <span className="text-[#00C2A8]">Como o sigilo profissional exige.</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm">
            Desenvolvido com os padrões de segurança que o direito exige. Seus clientes e processos estão blindados.
          </p>
        </motion.div>

        {/* Grid de itens */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 hover:border-white/20 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                <item.icon size={18} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Barra de selos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-6 bg-white/5 border border-white/10 rounded-2xl px-8 py-5"
        >
          {[
            { emoji: '🔒', label: 'TLS 1.3' },
            { emoji: '🛡️', label: 'LGPD Compliant' },
            { emoji: '☁️', label: 'AWS Infrastructure' },
            { emoji: '🔐', label: 'AES-256' },
            { emoji: '📋', label: 'ISO 27001 Aligned' },
            { emoji: '✅', label: 'OAB Compatible' },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2">
              <span className="text-base">{badge.emoji}</span>
              <span className="text-xs font-bold text-slate-300">{badge.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
