import bannerImg from '../../assets/banner_home_kealex.png'

export function HeroSection() {
  return (
    <section id="inicio" aria-label="Software jurídico com IA para escritórios de advocacia" className="relative pt-16">
      <img
        src={bannerImg}
        alt="Kealex — Software Jurídico com IA"
        className="w-full h-auto block"
        loading="eager"
      />
      <div className="absolute inset-0 flex items-end" style={{ paddingBottom: 'calc(5rem + 50px)' }}>
        <div className="pl-8 sm:pl-16 lg:pl-24">
          <a
            href="#recursos"
            className="inline-block bg-[#F96313] hover:bg-[#e0550f] text-white font-bold px-8 py-3.5 rounded-full transition-all shadow-lg text-sm sm:text-base"
          >
            Conheça a Kealex
          </a>
        </div>
      </div>
    </section>
  )
}
