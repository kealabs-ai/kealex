import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react'

interface Option {
  emoji: string
  short: string
  label: string
  answer: string
  highlight: string
}

const OPTIONS: Option[] = [
  {
    emoji: '⚖️',
    short: 'Prazos & DO',
    label: 'Perco muito tempo lendo Diário Oficial e controlando prazos.',
    answer:
      'O KeaLex captura suas intimações automaticamente nos tribunais e diários via IA e te avisa no WhatsApp antes que o prazo expire.',
    highlight: 'Zero riscos de perda de prazo.',
  },
  {
    emoji: '📁',
    short: 'Documentos',
    label: 'Meus clientes de Família mandam documentos soltos no WhatsApp.',
    answer:
      'Temos um Portal do Cliente com link criptografado: seu cliente sobe extratos e provas direto para a pasta do processo, sem bagunça no seu chat.',
    highlight: 'Organização total, sem esforço.',
  },
  {
    emoji: '💰',
    short: 'Honorários',
    label: 'Preciso organizar honorários parcelados e de êxito.',
    answer:
      'Nosso financeiro gera boletos/Pix via Asaas e controla parcelamentos contratuais e honorários de êxito de forma 100% automatizada.',
    highlight: 'Receba sem precisar cobrar manualmente.',
  },
  {
    emoji: '🚀',
    short: 'Visão geral',
    label: 'Quero conhecer o KeaLex completo.',
    answer:
      'O KeaLex une automação de prazos, inteligência processual e gestão financeira em uma interface leve e sem burocracia.',
    highlight: 'Tudo em um só lugar.',
  },
]

export function DiagnosticoSection() {
  const [selected, setSelected] = useState<Option | null>(null)
  const [typing, setTyping] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', contato: '' })
  const [done, setDone] = useState(false)

  const handleSelect = (opt: Option) => {
    setSelected(null)
    setShowForm(false)
    setDone(false)
    setTyping(true)
    setTimeout(() => {
      setSelected(opt)
      setTyping(false)
    }, 1200)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, origem: 'diagnostico_section' }),
      })
    } catch {
      // falha silenciosa
    }
    setDone(true)
  }

  return (
    <section id="diagnostico" className="py-20 bg-white relative overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-[#00C2A8]/30 to-transparent" />
        <div className="absolute -top-32 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-32 left-0 w-80 h-80 bg-[#00C2A8]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Diagnóstico Expresso · 30 segundos
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#081B33] mb-3">
            Qual é o maior gargalo do seu escritório?
          </h2>
          <p className="text-[#596B82] max-w-lg mx-auto text-sm">
            Selecione abaixo e veja como o KeaLex resolve exatamente o seu problema.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Coluna esquerda — opções */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {OPTIONS.map((opt, i) => (
              <motion.button
                key={opt.short}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left flex items-start gap-4 px-5 py-4 rounded-2xl border-2 transition-all group ${
                  selected?.short === opt.short
                    ? 'border-[#00C2A8] bg-[#00C2A8]/5 shadow-md shadow-[#00C2A8]/10'
                    : 'border-slate-100 bg-slate-50 hover:border-[#00C2A8]/50 hover:bg-white hover:shadow-sm'
                }`}
              >
                <span className="text-2xl leading-none mt-0.5 shrink-0">{opt.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-[#00C2A8] mb-0.5">{opt.short}</p>
                  <p className="text-sm text-[#081B33] font-medium leading-snug">{opt.label}</p>
                </div>
                {selected?.short === opt.short && (
                  <CheckCircle2 size={18} className="text-[#00C2A8] ml-auto shrink-0 mt-0.5" />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Coluna direita — resposta dinâmica */}
          <div className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {/* Estado inicial */}
              {!selected && !typing && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                    🤖
                  </div>
                  <p className="text-sm text-[#596B82] font-medium">
                    Selecione uma opção ao lado para ver como o KeaLex resolve seu problema em segundos.
                  </p>
                </motion.div>
              )}

              {/* Digitando */}
              {typing && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-2xl p-8 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-[#00C2A8]/20 flex items-center justify-center text-xl shrink-0">🤖</div>
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#00C2A8] animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                    <span className="text-xs text-slate-400 ml-2">KeaLex AI está digitando...</span>
                  </div>
                </motion.div>
              )}

              {/* Resposta */}
              {selected && !typing && (
                <motion.div
                  key={selected.short}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-white border border-[#00C2A8]/30 rounded-2xl overflow-hidden shadow-lg shadow-[#00C2A8]/10"
                >
                  {/* Header da resposta */}
                  <div className="bg-gradient-to-r from-[#081B33] to-[#0f2d4a] px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#00C2A8]/20 flex items-center justify-center text-lg shrink-0">🤖</div>
                    <div>
                      <p className="text-white font-bold text-sm">KeaLex AI</p>
                      <p className="text-[#00C2A8] text-[11px]">Resposta personalizada para você</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-sm text-[#081B33] leading-relaxed">{selected.answer}</p>
                    <div className="flex items-center gap-2 bg-[#00C2A8]/10 border border-[#00C2A8]/20 rounded-xl px-4 py-2.5">
                      <CheckCircle2 size={15} className="text-[#00C2A8] shrink-0" />
                      <p className="text-xs font-bold text-[#00C2A8]">{selected.highlight}</p>
                    </div>

                    {/* CTA ou formulário */}
                    {!showForm && !done && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-2">
                        <button
                          onClick={() => setShowForm(true)}
                          className="w-full bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                          style={{ animation: 'pulse-cta 2s infinite' }}
                        >
                          Garanta condições exclusivas de Fundador <ArrowRight size={15} />
                        </button>
                        <button
                          onClick={() => { setSelected(null); setShowForm(false) }}
                          className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <RotateCcw size={11} /> Escolher outro gargalo
                        </button>
                      </motion.div>
                    )}

                    {/* Formulário inline */}
                    {showForm && !done && (
                      <motion.form
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-3 pt-2 border-t border-slate-100"
                      >
                        <p className="text-xs font-bold text-[#081B33]">🎯 Garanta condições exclusivas de Fundador do KeaLex.</p>
                        <input
                          required
                          type="text"
                          placeholder="Seu nome"
                          value={form.nome}
                          onChange={(e) => setForm({ ...form, nome: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all"
                        />
                        <input
                          required
                          type="text"
                          placeholder="E-mail ou WhatsApp"
                          value={form.contato}
                          onChange={(e) => setForm({ ...form, contato: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all"
                        />
                        <button
                          type="submit"
                          className="w-full bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                        >
                          Liberar Meu Acesso Antecipado ➔
                        </button>
                      </motion.form>
                    )}

                    {/* Sucesso */}
                    {done && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4 space-y-2"
                      >
                        <CheckCircle2 size={36} className="text-[#00C2A8] mx-auto" />
                        <p className="text-sm font-bold text-[#081B33]">Pronto! Seu acesso prioritário foi reservado.</p>
                        <p className="text-xs text-slate-500">Verifique seu e-mail (ou WhatsApp) em breve.</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
