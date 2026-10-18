import { motion } from 'framer-motion'
import { BriefcaseBusiness, FileSearch, Bot, BookOpen, Cable, ShieldCheck } from 'lucide-react'

const SOLUTIONS = [
  { icon: BriefcaseBusiness, title: 'Gestão de Processos', text: 'Consulte e acompanhe processos judiciais em diferentes tribunais, instâncias e fóruns. Centralize movimentações, documentos e informações para facilitar o controle da sua carteira.' },
  { icon: FileSearch, title: 'Análise de Contratos com IA', text: 'Analise contratos e documentos jurídicos com inteligência artificial. Identifique cláusulas, obrigações, prazos, riscos e divergências, além de gerar resumos para apoiar revisões e negociações.' },
  { icon: Bot, title: 'Agentes Jurídicos Inteligentes', text: 'Conte com assistentes de IA especializados para pesquisar informações, resumir processos, analisar documentos e automatizar atividades repetitivas do escritório.' },
  { icon: BookOpen, title: 'Notebooks Jurídicos', text: 'Organize petições, contratos, decisões e provas em ambientes de conhecimento por cliente ou processo. Faça perguntas sobre os arquivos e encontre informações contextualizadas.' },
  { icon: Cable, title: 'Consultas e Integrações', text: 'Conecte informações processuais de diferentes sistemas e tribunais por meio de APIs e integrações, reduzindo consultas manuais e facilitando o acompanhamento dos casos.' },
  { icon: ShieldCheck, title: 'Segurança e Desempenho', text: 'Utilize uma plataforma em nuvem com tecnologia CDN e recursos de proteção de dados, desenvolvida para proporcionar agilidade e segurança no acesso às informações jurídicas.' },
]

export function SolutionsSection() {
  return <section id="solucoes" className="bg-[#F8FAFC] py-20 lg:py-24" aria-labelledby="solutions-title">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#00a991]">Escritórios e Profissionais</p>
        <h2 id="solutions-title" className="text-3xl font-extrabold text-[#081B33] sm:text-4xl">Mais produtividade, controle e inteligência para sua rotina jurídica.</h2>
        <p className="mt-4 leading-7 text-[#596B82]">A Kealex Legal Tech oferece soluções tecnológicas para advogados, escritórios de advocacia e profissionais do Direito, integrando gestão processual, inteligência artificial e automação em uma única plataforma.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SOLUTIONS.map(({ icon: Icon, title, text }, index) => <motion.article key={title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .05 }} className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
          <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#00C2A8]/10 text-[#008f7d]"><Icon size={21}/></span>
          <h3 className="mb-2 text-base font-bold text-[#081B33]">{title}</h3><p className="text-sm leading-6 text-[#596B82]">{text}</p>
        </motion.article>)}
      </div>
      <div className="mt-12 rounded-3xl bg-gradient-to-r from-[#081B33] to-[#0f2d4a] px-6 py-9 text-center text-white sm:px-10">
        <h3 className="text-2xl font-extrabold">Seu escritório mais inteligente. Seu tempo mais valorizado.</h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300">Reduza atividades operacionais, organize seus processos e use inteligência artificial para dedicar mais tempo à estratégia jurídica e ao atendimento dos seus clientes.</p>
        <p className="mt-3 font-semibold text-[#00D3B4]">Kealex — Sua prática jurídica conectada ao futuro.</p>
        <a href="#precos" className="mt-6 inline-flex rounded-xl bg-[#F96313] px-5 py-3 text-sm font-bold text-white hover:bg-[#e0550f]">Explore as soluções para seu escritório</a>
      </div>
    </div>
  </section>
}
