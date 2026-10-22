import { ArrowRight } from 'lucide-react'


export function DemoSection() {
  return <section id="demonstracao" className="bg-white py-20" aria-labelledby="demo-title">
    <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div><p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#008f7d]">Demonstração</p>
        <h2 id="demo-title" className="text-3xl font-extrabold text-[#081B33] sm:text-4xl">Conheça a Kealex em ação</h2>
        <p className="mt-4 text-lg leading-7 text-[#596B82]">Descubra como a tecnologia pode simplificar sua rotina jurídica.</p>
        <a href="/assinar" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#F96313] px-5 py-3 font-bold text-white hover:bg-[#e0550f]">Experimente a Kealex <ArrowRight size={17}/></a>
      </div>
      <div className="mt-8 aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-[#081B33] shadow-xl lg:mt-10">
        <iframe className="h-full w-full" src="https://www.youtube-nocookie.com/embed/Cjh4O4H7RbY?rel=0" title="Conheça a plataforma Kealex" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
      </div>
    </div>
  </section>
}
