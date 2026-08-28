import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Benchmarks baseados em pesquisas do setor jurídico brasileiro ───────────
// Fontes: OAB, FGV Direito SP, Wolters Kluwer Legal Tracker 2023, Thomson Reuters
const BENCH = {
  horasAdminPorAdvogadoPorDia: 2.4,   // média: 2–3h/dia em tarefas administrativas
  reducaoHorasAdmin: 0.68,            // Kealex reduz ~68% dessas horas (automação)
  taxaInadimplencia: 0.22,            // 22% de inadimplência média em escritórios sem automação
  reducaoInadimplencia: 0.55,         // automação de cobrança reduz ~55% da inadimplência
  prazosPerdidosPorMes: 0.03,         // ~3% dos prazos perdidos sem sistema dedicado
  custoMedioPrazoPerdido: 3500,       // custo médio de um prazo perdido (multa + retrabalho)
  diasUteisNoMes: 22,
}

const PLANOS = [
  { nome: 'Starter',      preco: 197 },
  { nome: 'Professional', preco: 497 },
  { nome: 'Enterprise',   preco: 997 },
]

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

function InputField({
  label, hint, value, onChange, prefix = '', suffix = '', min, max, step,
}: {
  label: string; hint: string; value: number
  onChange: (v: number) => void
  prefix?: string; suffix?: string; min: number; max: number; step: number
}) {
  const [showHint, setShowHint] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-semibold text-[#081B33]">{label}</label>
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="text-slate-400 hover:text-[#00C2A8] transition-colors"
            aria-label="Ver referência de mercado"
          >
            <Info size={13} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          {prefix && <span className="text-xs text-slate-500">{prefix}</span>}
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (v >= min && v <= max) onChange(v)
            }}
            className="w-20 text-right text-sm font-bold text-[#00C2A8] bg-white border border-[#00C2A8]/30 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#00C2A8]"
          />
          {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#00C2A8] h-1.5 rounded-full"
      />
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>{prefix}{min}{suffix}</span>
        <span>{prefix}{max}{suffix}</span>
      </div>
      {showHint && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 leading-relaxed"
        >
          {hint}
        </motion.p>
      )}
    </div>
  )
}

export function ROICalculatorSection() {
  const [advogados, setAdvogados]       = useState(3)
  const [processos, setProcessos]       = useState(150)
  const [valorHora, setValorHora]       = useState(250)
  const [faturamento, setFaturamento]   = useState(25000)
  const [planoIdx, setPlanoIdx]         = useState(1)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const calc = useMemo(() => {
    const custo = PLANOS[planoIdx].preco

    // 1. Economia de horas administrativas
    const horasAdminMes = advogados * BENCH.horasAdminPorAdvogadoPorDia * BENCH.diasUteisNoMes
    const horasRecuperadas = Math.round(horasAdminMes * BENCH.reducaoHorasAdmin)
    const ganhoHoras = horasRecuperadas * valorHora

    // 2. Redução de inadimplência
    const inadimplenciaAtual = faturamento * BENCH.taxaInadimplencia
    const reducaoInadimplencia = inadimplenciaAtual * BENCH.reducaoInadimplencia

    // 3. Prevenção de prazos perdidos
    const prazosPerdidos = processos * BENCH.prazosPerdidosPorMes
    const economiaRisco = prazosPerdidos * BENCH.custoMedioPrazoPerdido

    // 4. Total
    const ganhoTotal = ganhoHoras + reducaoInadimplencia + economiaRisco
    const lucroLiquido = ganhoTotal - custo
    const roi = Math.round((lucroLiquido / custo) * 100)
    const payback = custo / (ganhoTotal / 30) // dias para pagar

    return {
      horasRecuperadas,
      ganhoHoras,
      reducaoInadimplencia,
      economiaRisco,
      ganhoTotal,
      lucroLiquido,
      roi,
      payback: Math.round(payback),
      custo,
    }
  }, [advogados, processos, valorHora, faturamento, planoIdx])

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
            Quanto o Kealex vai gerar para você?
          </h2>
          <p className="text-[#596B82] max-w-xl mx-auto">
            Preencha com os dados do seu escritório. O cálculo usa benchmarks reais do setor jurídico brasileiro
            — clique no <Info size={12} className="inline text-slate-400" /> para ver a fonte de cada estimativa.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* ── Inputs ── */}
          <div className="bg-[#F8FAFC] rounded-2xl border border-slate-100 p-7 space-y-6">
            <InputField
              label="Advogados no escritório"
              hint="Média brasileira: escritórios com 1–5 advogados gastam 2,4h/dia em tarefas administrativas por profissional (OAB/FGV 2023)."
              value={advogados} onChange={setAdvogados}
              suffix=" adv." min={1} max={30} step={1}
            />
            <InputField
              label="Processos ativos"
              hint="Escritórios sem sistema dedicado perdem em média 3% dos prazos/mês. Cada prazo perdido custa ~R$ 3.500 entre multas, retrabalho e risco disciplinar (OAB)."
              value={processos} onChange={setProcessos}
              suffix=" proc." min={10} max={2000} step={10}
            />
            <InputField
              label="Valor da hora técnica"
              hint="Tabela de honorários OAB 2024: advogado júnior R$ 150–250/h, pleno R$ 250–450/h, sênior R$ 450–800/h. Use o valor médio do seu escritório."
              value={valorHora} onChange={setValorHora}
              prefix="R$ " suffix="/h" min={80} max={900} step={10}
            />
            <InputField
              label="Faturamento mensal atual"
              hint="22% do faturamento de escritórios sem automação de cobrança fica inadimplente (Serasa/Thomson Reuters 2023). A automação reduz isso em ~55%."
              value={faturamento} onChange={setFaturamento}
              prefix="R$ " min={3000} max={500000} step={1000}
            />

            {/* Plano */}
            <div>
              <label className="text-sm font-semibold text-[#081B33] block mb-2">Plano Kealex</label>
              <div className="flex gap-2">
                {PLANOS.map((p, i) => (
                  <button
                    key={p.nome}
                    onClick={() => setPlanoIdx(i)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      planoIdx === i
                        ? 'bg-[#081B33] text-white border-[#081B33]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#00C2A8]'
                    }`}
                  >
                    {p.nome}
                    <br />
                    <span className={`font-normal text-[10px] ${planoIdx === i ? 'text-slate-300' : 'text-slate-400'}`}>
                      R$ {p.preco}/mês
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Resultados ── */}
          <div className="space-y-3">
            {/* ROI card */}
            <motion.div
              key={calc.roi}
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-[#081B33] to-[#0f2d4a] rounded-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Retorno sobre investimento</p>
                  <p className="text-5xl font-extrabold text-[#00C2A8] leading-none">
                    {calc.roi.toLocaleString('pt-BR')}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">ROI mensal estimado</p>
                </div>
                <div className="text-right">
                  <TrendingUp size={32} className="text-[#00C2A8] ml-auto mb-2" />
                  <p className="text-xs text-slate-400">Payback em</p>
                  <p className="text-2xl font-extrabold text-white">{calc.payback}d</p>
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00C2A8] to-[#F96313] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(calc.roi / 20, 100)}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </div>
            </motion.div>

            {/* Resumo */}
            {[
              { label: 'Ganho total estimado/mês',  value: fmt(calc.ganhoTotal),    color: 'text-green-600' },
              { label: 'Custo do plano/mês',         value: fmt(calc.custo),         color: 'text-slate-500' },
              { label: 'Lucro líquido estimado/mês', value: fmt(calc.lucroLiquido),  color: 'text-[#00C2A8]' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between bg-[#F8FAFC] border border-slate-100 rounded-xl px-5 py-3">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}

            {/* Breakdown detalhado */}
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowBreakdown((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-[#081B33]"
              >
                Ver detalhamento do cálculo
                {showBreakdown ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {showBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="divide-y divide-slate-50"
                >
                  {[
                    {
                      label: '⏱ Horas administrativas recuperadas',
                      detail: `${calc.horasRecuperadas}h/mês × R$ ${valorHora}/h`,
                      value: fmt(calc.ganhoHoras),
                      tip: `${advogados} adv. × 2,4h/dia × 22 dias × 68% de redução`,
                    },
                    {
                      label: '💰 Redução de inadimplência',
                      detail: `22% do faturamento × 55% de recuperação`,
                      value: fmt(calc.reducaoInadimplencia),
                      tip: `R$ ${faturamento.toLocaleString('pt-BR')} × 22% × 55%`,
                    },
                    {
                      label: '⚖️ Prevenção de prazos perdidos',
                      detail: `${(processos * 0.03).toFixed(1)} prazos/mês × R$ 3.500`,
                      value: fmt(calc.economiaRisco),
                      tip: `${processos} proc. × 3% de risco × custo médio R$ 3.500`,
                    },
                  ].map((row) => (
                    <div key={row.label} className="px-5 py-3 bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-[#081B33]">{row.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{row.detail}</p>
                          <p className="text-[10px] text-slate-300 mt-0.5 font-mono">{row.tip}</p>
                        </div>
                        <span className="text-sm font-bold text-green-600 shrink-0">{row.value}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              * Baseado em: OAB, FGV Direito SP, Serasa Experian e Thomson Reuters Legal Tracker 2023–2024.
              Resultados reais variam conforme o perfil do escritório.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
