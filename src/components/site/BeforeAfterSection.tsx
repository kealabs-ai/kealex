import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

const ANTES = [
  'Prazos anotados em planilhas e post-its',
  'Cobranças esquecidas e inadimplência alta',
  'Documentos espalhados em e-mails e pastas',
  'Sem visibilidade financeira do escritório',
  'Pesquisa jurídica manual e demorada',
  'Clientes ligando para saber status do processo',
]

const DEPOIS = [
  'Alertas automáticos de prazos CPC/CLT',
  'Esteira de cobrança com 5 fases automatizadas',
  'CDN centralizado com acesso por perfil',
  'Dashboard financeiro com projeções em tempo real',
  'Kealex AI responde em segundos com STF/STJ',
  'Portal do cliente com visibilidade 24/7',
]

export function BeforeAfterSection() {
  return (
    <section id="beneficios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold text-[#00C2A8] uppercase tracking-widest mb-3">Transformação Real</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#081B33]">
            Antes vs. Depois da Kealex
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Antes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-red-50 border border-red-100 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <X size={20} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Advocacia Tradicional</p>
                <p className="text-xs text-slate-500">Planilhas, risco e retrabalho</p>
              </div>
            </div>
            <ul className="space-y-3">
              {ANTES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <X size={15} className="text-red-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Depois */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#f0fdf9] to-white border border-[#00C2A8]/20 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#00C2A8]/15 flex items-center justify-center">
                <Check size={20} className="text-[#00C2A8]" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Ecossistema Kealex AI</p>
                <p className="text-xs text-slate-500">Automação, segurança e escala</p>
              </div>
            </div>
            <ul className="space-y-3">
              {DEPOIS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                  <Check size={15} className="text-[#00C2A8] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
