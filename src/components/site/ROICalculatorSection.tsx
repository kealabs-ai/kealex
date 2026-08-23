import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const PLANOS = [
  { nome: 'Solo', preco: 97 },
  { nome: 'Escritório', preco: 247 },
  { nome: 'Premium', preco: 497 },
]

export function ROICalculatorSection() {
  const [advogados, setAdvogados] = useState(3)
  const [processos, setProcessos] = useState(150)
  const [valorHora, setValorHora] = useState(200)
  const [planoIdx, setPlanoIdx] = useState(1)

  const { horasEconomizadas, ganhoFinanceiro, roi } = useMemo(() => {
    const horas = advogados * 16
    const ganho = horas * valorHora + processos * 25
    const custo = PLANOS[planoIdx].preco
    return {
      horasEconomizadas: horas,
      ganhoFinanceiro: ganho,
      roi: Math.round(((ganho - custo) / custo) * 100),
    }
  }, [advogados, processos, valorHora, planoIdx])

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

  return (
    <section id="roi" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold text-[#00C2A8] uppercase tracking-widest mb-3">Calculadora de Retorno</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#081B33] mb-4">
            Quanto você vai economizar?
          </h2>
          <p className="text-[#596B82]">Ajuste os valores e veja o retorno real da Kealex para o seu escritório.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Sliders */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-100 p-7 space-y-7">
            {[
              { label: 'Advogados no escritório', value: advogados, min: 1, max: 20, step: 1, set: setAdvogados, suffix: advogados === 1 ? 'advogado' : 'advogados' },
              { label: 'Processos ativos', value: processos, min: 10, max: 1000, step: 10, set: setProcessos, suffix: 'processos' },
              { label: 'Valor médio da hora técnica', value: valorHora, min: 50, max: 600, step: 10, set: setValorHora, suffix: '/hora', prefix: 'R$' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-[#081B33]">{s.label}</label>
                  <span className="text-sm font-bold text-[#00C2A8]">
                    {s.prefix}{s.value}{s.suffix}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.value}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="w-full accent-[#00C2A8] h-2 rounded-full"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>{s.prefix}{s.min}{s.suffix}</span>
                  <span>{s.prefix}{s.max}{s.suffix}</span>
                </div>
              </div>
            ))}

            {/* Plano selector */}
            <div>
              <label className="text-sm font-semibold text-[#081B33] block mb-2">Plano selecionado</label>
              <div className="flex gap-2">
                {PLANOS.map((p, i) => (
                  <button
                    key={p.nome}
                    onClick={() => setPlanoIdx(i)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      planoIdx === i
                        ? 'bg-[#081B33] text-white border-[#081B33]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#00C2A8]'
                    }`}
                  >
                    {p.nome}<br />
                    <span className={`font-normal ${planoIdx === i ? 'text-slate-300' : 'text-slate-400'}`}>
                      R$ {p.preco}/mês
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <motion.div
              key={roi}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-[#081B33] to-[#0f2d4a] rounded-2xl p-7 text-white text-center"
            >
              <TrendingUp size={28} className="text-[#00C2A8] mx-auto mb-3" />
              <p className="text-sm text-slate-400 mb-1">Retorno sobre investimento</p>
              <p className="text-6xl font-extrabold text-[#00C2A8]">{roi.toLocaleString('pt-BR')}%</p>
              <p className="text-xs text-slate-500 mt-2">ROI mensal estimado</p>
            </motion.div>

            {[
              { label: 'Horas economizadas/mês', value: `${horasEconomizadas}h`, color: 'text-indigo-600' },
              { label: 'Ganho financeiro estimado', value: fmt(ganhoFinanceiro), color: 'text-green-600' },
              { label: 'Custo do plano', value: fmt(PLANOS[planoIdx].preco), color: 'text-slate-600' },
              { label: 'Lucro líquido estimado', value: fmt(ganhoFinanceiro - PLANOS[planoIdx].preco), color: 'text-[#00C2A8]' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between bg-[#F8FAFC] border border-slate-100 rounded-xl px-5 py-3.5">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}

            <p className="text-xs text-slate-400 text-center">
              * Estimativas baseadas em benchmarks do setor jurídico brasileiro.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
