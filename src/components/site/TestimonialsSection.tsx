import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const ITEMS = [
  { category: 'Gestão Processual', quote: 'A centralização das informações processuais pode facilitar o acompanhamento dos casos e reduzir o tempo gasto em consultas manuais.' },
  { category: 'Inteligência Artificial', quote: 'A análise de documentos com inteligência artificial pode tornar a revisão de contratos mais rápida e organizada.' },
  { category: 'Produtividade', quote: 'A automação de atividades operacionais permite que os profissionais concentrem mais esforços no atendimento e na estratégia jurídica.' },
]

export function TestimonialsSection() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStart = useRef(0)
  const change = useCallback((delta: number) => setIndex(current => (current + delta + ITEMS.length) % ITEMS.length), [])
  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => change(1), 6500)
    return () => window.clearInterval(timer)
  }, [paused, change])
  const item = ITEMS[index]
  return <section id="depoimentos" className="bg-[#F8FAFC] py-20" aria-labelledby="testimonials-title" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={event => { touchStart.current = event.touches[0].clientX }} onTouchEnd={event => { const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 50) change(delta < 0 ? 1 : -1) }}>
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"><header className="mb-10 text-center"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#008f7d]">Experiências e possibilidades</p><h2 id="testimonials-title" className="text-3xl font-extrabold text-[#081B33] sm:text-4xl">Tecnologia aplicada à rotina jurídica</h2></header>
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10"><div className="mb-5 flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#00C2A8]/10 text-[#008f7d]"><Quote size={23}/></span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Conteúdo demonstrativo</span></div><p className="text-xs font-bold uppercase tracking-wider text-[#008f7d]">{item.category}</p><blockquote className="mt-3 min-h-28 text-lg leading-8 text-[#081B33]">“{item.quote}”</blockquote><p className="mt-4 text-xs text-slate-500">Exemplo ilustrativo, não é um depoimento de cliente.</p></div>
      <div className="mt-5 flex items-center justify-center gap-5"><button type="button" onClick={() => { change(-1); setPaused(true) }} aria-label="Depoimento demonstrativo anterior" className="rounded-full border border-slate-300 p-2 text-[#081B33] hover:bg-white"><ChevronLeft size={20}/></button><div className="flex gap-2" aria-label={`Exemplo ${index + 1} de ${ITEMS.length}`}>{ITEMS.map((entry, i) => <button key={entry.category} type="button" aria-label={`Mostrar exemplo: ${entry.category}`} aria-current={i === index} onClick={() => { setIndex(i); setPaused(true) }} className={`h-2.5 rounded-full transition-all ${i === index ? 'w-7 bg-[#00a991]' : 'w-2.5 bg-slate-300'}`}/>)}</div><button type="button" onClick={() => { change(1); setPaused(true) }} aria-label="Próximo depoimento demonstrativo" className="rounded-full border border-slate-300 p-2 text-[#081B33] hover:bg-white"><ChevronRight size={20}/></button></div>
    </div>
  </section>
}
