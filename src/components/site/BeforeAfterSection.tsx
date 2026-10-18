import { motion } from 'framer-motion'
import { Activity, FolderOpen, Zap, Workflow, Brain, TrendingUp } from 'lucide-react'

const BENEFITS = [
  { icon: Activity, title: 'Mais produtividade', text: 'Reduza o esforço dedicado a tarefas repetitivas e recupere tempo para o trabalho jurídico.' },
  { icon: FolderOpen, title: 'Centralização', text: 'Mantenha documentos, processos e informações organizados em um só ambiente.' },
  { icon: Zap, title: 'Agilidade', text: 'Facilite consultas, acompanhamento processual e análises jurídicas.' },
  { icon: Workflow, title: 'Automação', text: 'Simplifique fluxos operacionais, prazos, cobranças e atividades do escritório.' },
  { icon: Brain, title: 'Inteligência', text: 'Use inteligência artificial para apoiar pesquisas e análises, com decisão profissional.' },
  { icon: TrendingUp, title: 'Escalabilidade', text: 'Organize sua operação para acompanhar o crescimento do escritório.' },
]

export function BeforeAfterSection() {
  return <section id="beneficios" className="bg-white py-20" aria-labelledby="benefits-title">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="mx-auto mb-12 max-w-2xl text-center"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#008f7d]">Transformação Real</p><h2 id="benefits-title" className="text-3xl font-extrabold text-[#081B33] sm:text-4xl">Tecnologia para uma rotina jurídica mais organizada</h2><p className="mt-3 text-[#596B82]">Recursos de gestão e automação para apoiar o dia a dia do escritório.</p></header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{BENEFITS.map(({ icon: Icon, title, text }, index) => <motion.article key={title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .05 }} className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 transition hover:-translate-y-1 hover:shadow-lg"><span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#00C2A8]/10 text-[#008f7d]"><Icon size={21}/></span><h3 className="font-bold text-[#081B33]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#596B82]">{text}</p></motion.article>)}</div>
    </div>
  </section>
}
