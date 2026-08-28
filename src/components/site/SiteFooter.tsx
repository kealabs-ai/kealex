import logo from '../../assets/logotipo_kealex.png'

export function SiteFooter() {
  return (
    <footer className="bg-[#081B33] text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img src={logo} alt="Kealex" className="h-8 w-auto object-contain mb-4 brightness-0 invert" />
            <p className="text-sm leading-relaxed mb-4">
              Plataforma jurídica SaaS com IA especializada no direito brasileiro.
            </p>
            <p className="text-xs text-slate-500">Kealabs AI © 2026. Todos os direitos reservados.</p>
          </div>

          {/* Produto */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">Produto</p>
            <ul className="space-y-2.5 text-sm">
              {['Recursos', 'Kealex AI', 'Preços', 'Changelog', 'Status'].map((l) => (
                <li key={l}><a href="#" className="hover:text-[#00C2A8] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">Empresa</p>
            <ul className="space-y-2.5 text-sm">
              {['Sobre a Kealabs', 'Blog Jurídico', 'Parceiros', 'Imprensa', 'Carreiras'].map((l) => (
                <li key={l}><a href="#" className="hover:text-[#00C2A8] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">Legal & Suporte</p>
            <ul className="space-y-2.5 text-sm">
              {['Termos de Uso', 'Política de Privacidade', 'LGPD', 'Suporte', 'Contato'].map((l) => (
                <li key={l}><a href="#" className="hover:text-[#00C2A8] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>Kealabs AI © 2026. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C2A8] animate-pulse" />
            <span>Todos os sistemas operacionais</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
