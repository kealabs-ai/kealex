import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, BadgeCheck } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Dra. Camila Mendes',
    role: 'Advogada Trabalhista · OAB/SP',
    initials: 'CM',
    color: 'from-violet-500 to-indigo-600',
    stars: 5,
    quote:
      'Reduzi drasticamente o tempo organizando documentos de divórcio e nunca mais perdi um prazo trabalhista. O KeaLex me devolveu pelo menos 2 horas por dia que eu gastava em planilhas.',
    metric: '2h/dia economizadas',
  },
  {
    name: 'Dr. Rafael Souza',
    role: 'Advogado de Família · OAB/RJ',
    initials: 'RS',
    color: 'from-teal-500 to-cyan-600',
    stars: 5,
    quote:
      'Meus clientes paravam de me ligar perguntando sobre o processo. Com o Portal do Cliente, eles acompanham tudo sozinhos. Minha produtividade triplicou no primeiro mês.',
    metric: '3× mais produtivo',
  },
  {
    name: 'Dra. Juliana Ferreira',
    role: 'Advogada Autônoma · OAB/MG',
    initials: 'JF',
    color: 'from-orange-500 to-amber-600',
    stars: 5,
    quote:
      'Cobrava honorários parcelados no braço, esquecia parcelas, perdia dinheiro. Hoje o KeaLex gera os boletos automaticamente e minha inadimplência caiu mais de 60%.',
    metric: '60% menos inadimplência',
  },
  {
    name: 'Dr. Marcos Oliveira',
    role: 'Escritório Trabalhista · OAB/RS',
    initials: 'MO',
    color: 'from-blue-500 to-indigo-500',
    stars: 5,
    quote:
      'A IA do KeaLex me ajuda a montar contestações em minutos. O que levava 3 horas agora leva 40 minutos. Consegui pegar mais clientes sem contratar mais ninguém.',
    metric: 'R$ 4.200/mês a mais',
  },
  {
    name: 'Dra. Patrícia Lima',
    role: 'Advogada Previdenciária · OAB/BA',
    initials: 'PL',
    color: 'from-rose-500 to-pink-600',
    stars: 5,
    quote:
      'Recém-formada, não tinha dinheiro para contratar secretária. O KeaLex faz o trabalho administrativo por mim. Hoje tenho 80 processos ativos e gerencio tudo sozinha.',
    metric: '80 processos · 1 pessoa',
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const go = useCallback((dir: number) => {
    setDirection(dir)
    setCurrent((c) => (c + dir + TESTIMONIALS.length) % TESTIMONIALS.length)
  }, [])

  // Auto-play
  useEffect(() => {
    const t = setInterval(() => go(1), 5500)
    return () => clearInterval(t)
  }, [go])

  const t = TESTIMONIALS[current]

  return (
    <section id="depoimentos" className="py-20 bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00C2A8]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold text-[#00C2A8] uppercase tracking-widest mb-3">Prova Social</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#081B33] mb-4">
            Advogados que transformaram seus escritórios
          </h2>
          {/* Selo de validação */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#00C2A8]/30 rounded-full px-5 py-2 shadow-sm">
            <BadgeCheck size={16} className="text-[#00C2A8]" />
            <span className="text-xs font-semibold text-[#596B82]">
              Validado por advogados autônomos e pequenos escritórios
            </span>
          </div>
        </motion.div>

        {/* Carrossel principal */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={{
                enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 lg:p-10"
            >
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Avatar + info */}
                <div className="flex flex-row lg:flex-col items-center lg:items-center gap-4 lg:gap-3 shrink-0">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xl font-extrabold shadow-lg`}>
                    {t.initials}
                  </div>
                  <div className="lg:text-center">
                    <p className="font-bold text-[#081B33] text-sm">{t.name}</p>
                    <p className="text-xs text-[#596B82] mt-0.5">{t.role}</p>
                    <div className="flex gap-0.5 mt-1.5 lg:justify-center">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <div className="flex-1">
                  <svg className="w-8 h-8 text-[#00C2A8]/30 mb-3" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M10 8C6.686 8 4 10.686 4 14v10h10V14H7.5C7.5 11.515 9.015 10 10 10V8zm14 0c-3.314 0-6 2.686-6 6v10h10V14h-6.5C21.5 11.515 23.015 10 24 10V8z" />
                  </svg>
                  <p className="text-base lg:text-lg text-[#081B33] leading-relaxed font-medium italic mb-5">
                    "{t.quote}"
                  </p>
                  <div className="inline-flex items-center gap-2 bg-[#00C2A8]/10 border border-[#00C2A8]/20 rounded-xl px-4 py-2">
                    <span className="text-xs font-bold text-[#00C2A8]">📈 {t.metric}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controles */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-[#00C2A8]' : 'w-1.5 bg-slate-200 hover:bg-slate-300'}`}
                  aria-label={`Depoimento ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => go(-1)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:border-[#00C2A8] hover:text-[#00C2A8] flex items-center justify-center transition-all text-slate-500"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => go(1)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:border-[#00C2A8] hover:text-[#00C2A8] flex items-center justify-center transition-all text-slate-500"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Grid de mini-cards abaixo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8">
          {TESTIMONIALS.map((item, i) => (
            <button
              key={item.name}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center ${
                i === current
                  ? 'border-[#00C2A8] bg-[#00C2A8]/5 shadow-sm'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-xs font-bold`}>
                {item.initials}
              </div>
              <p className="text-[10px] font-semibold text-[#081B33] leading-tight">{item.name.split(' ').slice(0, 2).join(' ')}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
