import bannerImg from '../../assets/banner_home_kealex.png'

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
    </section>
  )
}
