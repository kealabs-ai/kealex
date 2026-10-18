import bannerImg from '../../assets/banner_home_kealex.png'
import { scrollToSiteSection } from './navigation'

export function HeroSection() {
  return (
    <section id="inicio" aria-label="Software jurídico com IA para escritórios de advocacia" className="bg-white pt-20">
      <h1 className="sr-only">Plataforma de gestão jurídica para advogados e escritórios</h1>
      <img
        src={bannerImg}
        alt="Banner Kealex: inteligência artificial para transformar a rotina jurídica, com a mascote da marca e uma prévia da plataforma"
        className="block h-auto w-full"
        loading="eager"
        fetchPriority="high"
      />
      <div className="flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-white to-[#F8FAFC] px-4 py-5 sm:flex-row sm:py-6">
        <button onClick={() => scrollToSiteSection('recursos')} className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-xl bg-[#F96313] px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#e0550f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#F96313] sm:w-auto">
          Conheça a Kealex <span aria-hidden="true" className="ml-2">→</span>
        </button>
        <button onClick={() => scrollToSiteSection('plataforma')} className="inline-flex min-h-11 w-full max-w-xs items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-[#081B33] transition hover:border-[#00C2A8] hover:text-[#087f72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F96313] sm:w-auto">
          Ver demonstração
        </button>
      </div>
    </section>
  )
}
