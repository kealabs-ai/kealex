import { PlayCircle, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export function DemoSection() {
  const [playing, setPlaying] = useState(false)
  return <section id="demonstracao" className="bg-white py-20" aria-labelledby="demo-title">
    <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#008f7d]">Demonstração</p>
        <h2 id="demo-title" className="text-3xl font-extrabold text-[#081B33] sm:text-4xl">Conheça a Kealex em ação</h2>
        <p className="mt-4 text-lg leading-7 text-[#596B82]">Descubra como a tecnologia pode simplificar sua rotina jurídica.</p>
        <a href="/assinar" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#F96313] px-5 py-3 font-bold text-white hover:bg-[#e0550f]">Experimente a Kealex <ArrowRight size={17}/></a>
      </div>
      <div className="mt-8 aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-[#081B33] shadow-xl lg:mt-10">
        {playing ? <div className="flex h-full flex-col items-center justify-center px-6 text-center text-white"><PlayCircle size={42} className="mb-3 text-[#00D3B4]"/><p className="font-semibold">Demonstração em vídeo em breve</p><p className="mt-1 text-sm text-slate-300">A equipe Kealex ainda não disponibilizou a mídia.</p></div> : <button type="button" onClick={() => setPlaying(true)} aria-label="Abrir espaço reservado para demonstração da plataforma" className="group flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_#14425a,_#081B33_70%)] text-white"><span className="grid h-16 w-16 place-items-center rounded-full bg-[#F96313] shadow-lg transition group-hover:scale-105"><PlayCircle size={34}/></span><span className="mt-4 font-semibold">Conheça a plataforma Kealex</span><span className="mt-1 text-xs text-slate-300">Vídeo demonstrativo em breve</span></button>}
      </div>
    </div>
  </section>
}
