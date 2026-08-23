import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Sparkles } from 'lucide-react'

const PROMPTS = [
  { label: '⏱️ Prazo Apelação CPC', q: 'Qual o prazo para interpor apelação no CPC?', a: 'O prazo para interpor **apelação** é de **15 dias úteis**, conforme o art. 1.003, §5º do CPC/2015. O prazo começa a contar da intimação da sentença. Em caso de litisconsortes com diferentes procuradores, o prazo é contado em dobro (art. 229 CPC), exceto em processos eletrônicos.' },
  { label: '⚖️ Tese STJ Danos Morais', q: 'Qual a tese do STJ sobre danos morais por negativação indevida?', a: 'O STJ consolidou o entendimento na **Súmula 385** que: *"Da anotação irregular em cadastro de proteção ao crédito, não cabe indenização por dano moral, quando preexistente legítima inscrição, ressalvado o direito ao cancelamento."* Contudo, a **1ª negativação indevida** gera dano moral presumido (in re ipsa), dispensando prova do prejuízo — posição reiterada no REsp 1.059.663/MS.' },
  { label: '📝 Minuta Contestação', q: 'Gere o cabeçalho de uma contestação trabalhista', a: '**EXCELENTÍSSIMO(A) SENHOR(A) JUIZ(A) DO TRABALHO DA ___ VARA DO TRABALHO DE ___**\n\n**[NOME DA EMPRESA]**, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ___, com sede na ___, por seu advogado que esta subscreve (OAB/__ nº ___), vem, respeitosamente, à presença de Vossa Excelência, nos autos do processo nº ___, em que é Reclamante **[NOME DO RECLAMANTE]**, apresentar **CONTESTAÇÃO**, pelos fatos e fundamentos a seguir expostos.' },
]

export function AISimulatorSection() {
  const [active, setActive] = useState<typeof PROMPTS[0] | null>(null)
  const [custom, setCustom] = useState('')
  const [typing, setTyping] = useState(false)

  const handlePrompt = (p: typeof PROMPTS[0]) => {
    setActive(null)
    setTyping(true)
    setTimeout(() => { setActive(p); setTyping(false) }, 900)
  }

  const handleCustom = () => {
    if (!custom.trim()) return
    handlePrompt({ label: '💬 Pergunta personalizada', q: custom, a: 'Analisando sua consulta com base no CPC, CLT e jurisprudência STF/STJ... Esta é uma demonstração. Na plataforma completa, a Kealex AI responde com precisão jurídica em tempo real, com streaming de respostas e citação de fontes.' })
    setCustom('')
  }

  return (
    <section id="kealex-ai" className="py-20 bg-[#081B33] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00C2A8]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-[#00C2A8]/15 border border-[#00C2A8]/30 rounded-full px-4 py-1.5 mb-5">
            <Sparkles size={13} className="text-[#00C2A8]" />
            <span className="text-xs font-semibold text-[#00C2A8]">Powered by GPT-4o</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            Kealex AI — Experimente Agora
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            IA especializada no direito brasileiro. Prazos, jurisprudência, minutas e análise de casos em segundos.
          </p>
        </motion.div>

        {/* Chat window */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          {/* Prompt buttons */}
          <div className="flex flex-wrap gap-2 p-4 border-b border-white/10">
            {PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePrompt(p)}
                className="text-xs font-medium bg-white/10 hover:bg-[#00C2A8]/20 border border-white/10 hover:border-[#00C2A8]/40 text-white px-3 py-1.5 rounded-lg transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div className="p-5 min-h-[200px]">
            <AnimatePresence mode="wait">
              {!active && !typing && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-40 text-slate-500"
                >
                  <Bot size={32} className="text-[#00C2A8]/40 mb-2" />
                  <p className="text-sm">Clique em um prompt acima ou faça sua pergunta</p>
                </motion.div>
              )}

              {typing && (
                <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00C2A8]/20 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-[#00C2A8]" />
                  </div>
                  <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00C2A8]"
                        animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {active && !typing && (
                <motion.div key="response" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* User */}
                  <div className="flex justify-end">
                    <div className="bg-[#00C2A8]/20 border border-[#00C2A8]/20 rounded-xl px-4 py-2.5 max-w-sm">
                      <p className="text-sm text-white">{active.q}</p>
                    </div>
                  </div>
                  {/* AI */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00C2A8]/20 flex items-center justify-center shrink-0">
                      <Bot size={16} className="text-[#00C2A8]" />
                    </div>
                    <div className="bg-white/10 rounded-xl px-4 py-3 max-w-2xl">
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{active.a}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 flex gap-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustom()}
              placeholder="Digite sua dúvida jurídica..."
              className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2A8]/50"
            />
            <button
              onClick={handleCustom}
              className="w-10 h-10 bg-[#00C2A8] hover:bg-[#00a892] rounded-xl flex items-center justify-center transition-colors"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
