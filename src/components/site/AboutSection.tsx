import { motion } from 'framer-motion'
import { Compass, Layers3, HeartHandshake } from 'lucide-react'

const PILLARS = [
  {
    icon: Compass,
    title: 'Mais clareza na rotina',
    text: 'Reunimos processos, prazos, documentos e informações financeiras para facilitar a visão do escritório sobre o trabalho em andamento.',
  },
  {
    icon: Layers3,
    title: 'Ferramentas que se conectam',
    text: 'A plataforma foi pensada para apoiar diferentes etapas da gestão jurídica em um só ambiente, com recursos que acompanham as necessidades da operação.',
  },
  {
    icon: HeartHandshake,
    title: 'Tecnologia a serviço das pessoas',
    text: 'Automação e inteligência artificial podem apoiar tarefas do dia a dia. A análise, as decisões e a responsabilidade profissional permanecem com o advogado.',
  },
]

export function AboutSection() {
  return (
    <section id="sobre-nos" aria-labelledby="about-title" className="relative overflow-hidden bg-[#061E3C] py-20 lg:py-24">
      <div aria-hidden="true" className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-[#00C2A8]/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#F96313]/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#00D3B4]">Sobre a Kealex</p>
          <h2 id="about-title" className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Tecnologia que impulsiona o Direito e aproxima você do que realmente importa.
          </h2>
          <p className="mt-6 text-base leading-8 text-slate-300">
            A Kealex nasceu para ajudar advogados e escritórios a conduzir sua rotina com mais organização e visibilidade. Em vez de alternar entre planilhas, agendas, arquivos e conversas, a equipe pode reunir informações importantes do trabalho jurídico em uma plataforma criada para essa realidade.
          </p>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Nosso papel é simplificar a gestão para que cada profissional possa dedicar mais atenção à análise jurídica e ao atendimento de seus clientes. A Kealex oferece recursos de tecnologia e inteligência artificial como apoio ao trabalho; o conhecimento, o julgamento e a decisão continuam sendo de quem exerce a advocacia.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, text }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm"
            >
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#00C2A8]/15 text-[#00D3B4]"><Icon size={21} /></span>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
