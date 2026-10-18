import { Link } from 'react-router-dom'
import { Globe, Mail, ShieldCheck } from 'lucide-react'
import logo from '../../assets/logotipo_kealex.png'
import { scrollToSiteSection } from './navigation'

function AnchorLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={`#${href}`}
      onClick={(e) => { e.preventDefault(); scrollToSiteSection(href) }}
      className="hover:text-[#00C2A8] transition-colors"
    >
      {children}
    </a>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-[#081B33] text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <img src={logo} alt="Kealex" className="h-8 w-auto object-contain mb-4 brightness-0 invert" />
            <p className="text-sm leading-relaxed mb-4">
              Tecnologia, inteligência artificial e gestão para conectar sua prática jurídica ao futuro.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-[#00C2A8] shrink-0" />
              <span>Legal Tech para profissionais do Direito</span>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">Navegação</p>
            <ul className="space-y-2.5 text-sm">
              <li><AnchorLink href="sobre-nos">Sobre Nós</AnchorLink></li>
              <li><AnchorLink href="solucoes">Soluções</AnchorLink></li>
              <li><AnchorLink href="demonstracao">Plataforma</AnchorLink></li>
              <li><AnchorLink href="beneficios">Benefícios</AnchorLink></li>
              <li><AnchorLink href="demonstracao">Demonstração</AnchorLink></li>
              <li><AnchorLink href="recursos">Recursos</AnchorLink></li>
              <li><AnchorLink href="roi">Simule ROI</AnchorLink></li>
            </ul>
          </div>

          {/* Informações */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">Informações</p>
            <ul className="space-y-2.5 text-sm">
              <li><AnchorLink href="precos">Preços</AnchorLink></li>
              <li><AnchorLink href="faq">FAQ</AnchorLink></li>
              <li><AnchorLink href="contato">Contato</AnchorLink></li>
              <li><AnchorLink href="depoimentos">Depoimentos</AnchorLink></li>
              <li>
                <AnchorLink href="seguranca">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-[#00C2A8]" />
                    Segurança &amp; Compliance
                  </span>
                </AnchorLink>
              </li>
            </ul>
          </div>

          {/* Contato e informações legais */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">Contato e Legal</p>
            <ul className="space-y-2.5 text-sm">
              <li><a href="mailto:contato@kealabs.com.br" className="flex items-center gap-2 hover:text-[#00C2A8] transition-colors"><Mail size={14}/>contato@kealabs.com.br</a></li>
              <li><a href="https://www.kealex.com.br" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#00C2A8] transition-colors"><Globe size={14}/>www.kealex.com.br</a></li>
              <li><a href="mailto:suporte@kealabs.com.br" className="hover:text-[#00C2A8] transition-colors">Suporte</a></li>
              <li>
                <Link to="/lgpd" className="hover:text-[#00C2A8] transition-colors flex items-center gap-1.5">
                  LGPD &amp; Privacidade
                  <span className="text-[9px] font-bold bg-[#00C2A8]/20 text-[#00C2A8] px-1.5 py-0.5 rounded-full">Lei 13.709</span>
                </Link>
              </li>
              <li><Link to="/termos" className="hover:text-[#00C2A8] transition-colors">Termos de Uso</Link></li>
              <li><a href="mailto:suporte@kealabs.com.br" className="hover:text-[#00C2A8] transition-colors">Suporte</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>Kealabs AI © 2026. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link to="/lgpd" className="hover:text-[#00C2A8] transition-colors">Privacidade</Link>
            <span className="w-px h-3 bg-white/10" />
            <Link to="/termos" className="hover:text-[#00C2A8] transition-colors">Termos</Link>
            <span className="w-px h-3 bg-white/10" />
            <a href="mailto:privacidade@kealabs.com.br" className="hover:text-[#00C2A8] transition-colors">DPO</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
