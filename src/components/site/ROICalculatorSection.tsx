import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'

const INITIAL = { profissionais: '3', horasSemanais: '8', custoHora: '150', reducao: 30, investimento: '397' }
const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
const numeric = (value: string) => value.trim() === '' ? null : Math.max(0, Number(value) || 0)

export function ROICalculatorSection() {
  const [inputs, setInputs] = useState(INITIAL)
  const set = (key: 'profissionais' | 'horasSemanais' | 'custoHora' | 'investimento', value: string) => setInputs(current => ({ ...current, [key]: value }))
  const result = useMemo(() => {
    const profissionais = numeric(inputs.profissionais), horas = numeric(inputs.horasSemanais), custo = numeric(inputs.custoHora), investimento = numeric(inputs.investimento)
    if (profissionais === null || horas === null || custo === null || investimento === null || !profissionais || !horas || !custo) return null
    const horasMensais = profissionais * horas * (52 / 12)
    const horasEconomizadas = horasMensais * inputs.reducao / 100
    const economiaMensal = horasEconomizadas * custo
    const beneficioLiquido = economiaMensal - investimento
    return { horasEconomizadas, economiaMensal, economiaAnual: economiaMensal * 12, beneficioLiquido, roi: investimento > 0 ? beneficioLiquido / investimento * 100 : null }
  }, [inputs])
  const field = 'mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#081B33] outline-none focus:border-[#00a991] focus:ring-2 focus:ring-[#00C2A8]/15'
  return <section id="roi" className="bg-white py-20" aria-labelledby="roi-title">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <header className="mx-auto mb-10 max-w-3xl text-center"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#008f7d]">Simule ROI</p><h2 id="roi-title" className="text-3xl font-extrabold text-[#081B33] sm:text-4xl">Descubra quanto tempo e recursos seu escritório pode economizar</h2><p className="mt-3 text-[#596B82]">Simule o impacto da automação e da inteligência artificial na produtividade da sua equipe.</p></header>
      <div className="grid gap-7 lg:grid-cols-[.9fr_1.1fr]">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6">
          <label className="block text-sm font-semibold text-[#081B33]">Número de profissionais<input className={field} type="number" min="0" step="1" value={inputs.profissionais} onChange={e => set('profissionais', e.target.value)} /></label>
          <label className="block text-sm font-semibold text-[#081B33]">Horas semanais por profissional em tarefas operacionais<input className={field} type="number" min="0" step="0.5" value={inputs.horasSemanais} onChange={e => set('horasSemanais', e.target.value)} /></label>
          <label className="block text-sm font-semibold text-[#081B33]">Custo médio por hora profissional<input className={field} type="number" min="0" step="0.01" value={inputs.custoHora} onChange={e => set('custoHora', e.target.value)} /></label>
          <label className="block text-sm font-semibold text-[#081B33]">Redução estimada do tempo operacional: <span className="text-[#008f7d]">{inputs.reducao}%</span><input className="mt-3 w-full accent-[#00a991]" type="range" min="0" max="100" step="1" value={inputs.reducao} onChange={e => setInputs(current => ({ ...current, reducao: Number(e.target.value) }))} /></label>
          <label className="block text-sm font-semibold text-[#081B33]">Investimento mensal na Kealex<input className={field} type="number" min="0" step="0.01" value={inputs.investimento} onChange={e => set('investimento', e.target.value)} /></label>
          <button type="button" onClick={() => setInputs(INITIAL)} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#596B82] hover:text-[#008f7d]"><RotateCcw size={16}/>Reiniciar simulação</button>
        </div>
        <div aria-live="polite">
          {!result ? <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Informe valores válidos maiores que zero para profissionais, horas e custo por hora para ver a estimativa.</div> : <>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Horas potencialmente economizadas por mês', value: `${result.horasEconomizadas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`, primary: false },
                { label: 'Economia mensal estimada', value: money(result.economiaMensal), primary: true },
                { label: 'Economia anual estimada', value: money(result.economiaAnual), primary: false },
                { label: 'Benefício líquido mensal estimado', value: money(result.beneficioLiquido), primary: false },
              ].map(card => <article key={card.label} className={`rounded-2xl border p-5 ${card.primary ? 'border-[#00a991] bg-[#00a991] text-white sm:col-span-2' : 'border-slate-200 bg-[#F8FAFC] text-[#081B33]'}`}><p className={`text-xs ${card.primary ? 'text-white/80' : 'text-slate-500'}`}>{card.label}</p><p className="mt-2 text-2xl font-extrabold">{card.value}</p></article>)}
              <article className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 text-[#081B33] sm:col-span-2"><p className="text-xs text-slate-500">ROI mensal estimado</p><p className="mt-2 text-2xl font-extrabold">{result.roi === null ? 'Informe investimento maior que zero' : `${result.roi.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}</p></article>
            </div>
          </>}
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">Os resultados são estimativas ilustrativas, baseadas nos dados informados pelo usuário. Não representam garantia de economia ou retorno financeiro.</p>
        </div>
      </div>
    </div>
  </section>
}
