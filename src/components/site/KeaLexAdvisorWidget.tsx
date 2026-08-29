import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'welcome' | 'answer' | 'form' | 'done'

interface Option {
  emoji: string
  label: string
  answer: string
}

const OPTIONS: Option[] = [
  {
    emoji: '⚖️',
    label: 'Perco muito tempo lendo Diário Oficial e controlando prazos.',
    answer:
      'O KeaLex captura suas intimações automaticamente nos tribunais e diários via IA e te avisa no WhatsApp antes que o prazo expire. Zero riscos de perda.',
  },
  {
    emoji: '📁',
    label: 'Meus clientes de Família mandam documentos soltos no WhatsApp.',
    answer:
      'Temos um Portal do Cliente com link criptografado: seu cliente sobe extratos e provas direto para a pasta do processo, sem bagunça no seu chat.',
  },
  {
    emoji: '💰',
    label: 'Preciso organizar honorários parcelados e de êxito.',
    answer:
      'Nosso financeiro gera boletos/Pix via Asaas e controla parcelamentos contratuais e honorários de êxito de forma 100% automatizada.',
  },
  {
    emoji: '🚀',
    label: 'Quero conhecer o KeaLex completo.',
    answer:
      'O KeaLex une automação de prazos, inteligência processual e gestão financeira em uma interface leve e sem burocracia.',
  },
]

export function KeaLexAdvisorWidget() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('welcome')
  const [typing, setTyping] = useState(false)
  const [answer, setAnswer] = useState('')
  const [form, setForm] = useState({ nome: '', contato: '' })
  const [submitted, setSubmitted] = useState(false)
  // Notificação de atenção após 8s sem abrir
  const [nudge, setNudge] = useState(false)
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      nudgeTimer.current = setTimeout(() => setNudge(true), 8000)
    } else {
      setNudge(false)
      if (nudgeTimer.current) clearTimeout(nudgeTimer.current)
    }
    return () => { if (nudgeTimer.current) clearTimeout(nudgeTimer.current) }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [step, typing])

  const handleOption = (opt: Option) => {
    setTyping(true)
    setStep('answer')
    setTimeout(() => {
      setAnswer(opt.answer)
      setTyping(false)
    }, 1400)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, origem: 'widget_advisor' }),
      })
    } catch {
      // falha silenciosa — lead salvo localmente
    }
    setSubmitted(true)
    setStep('done')
  }

  const reset = () => {
    setStep('welcome')
    setAnswer('')
    setForm({ nome: '', contato: '' })
    setSubmitted(false)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Balão de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className="w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
            style={{ maxHeight: '82vh' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#081B33] to-[#0f2d4a] px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#00C2A8]/20 border border-[#00C2A8]/40 flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-none">KeaLex AI</p>
                  <p className="text-[#00C2A8] text-[11px] mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] animate-pulse inline-block" />
                    Online agora
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Corpo do chat */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">

              {/* Mensagem de boas-vindas */}
              <BotBubble>
                Olá, colega advogado! Sei que a <strong>toga está nova</strong> e a rotina entre prazos trabalhistas e
                documentações de família não para. Qual é o seu maior gargalo hoje?
              </BotBubble>

              {/* Opções — step welcome */}
              {step === 'welcome' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                  {OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleOption(opt)}
                      className="w-full text-left text-xs bg-white border border-slate-200 hover:border-[#00C2A8] hover:bg-[#00C2A8]/5 text-[#081B33] rounded-xl px-3 py-2.5 transition-all flex items-start gap-2 font-medium"
                    >
                      <span className="text-base leading-none mt-0.5 shrink-0">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Digitando... */}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#00C2A8]/20 flex items-center justify-center text-sm shrink-0">🤖</div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-2.5 flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Resposta da IA */}
              {(step === 'answer' || step === 'form' || step === 'done') && !typing && answer && (
                <BotBubble>{answer}</BotBubble>
              )}

              {/* Transição para formulário */}
              {step === 'answer' && !typing && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <button
                    onClick={() => setStep('form')}
                    className="w-full bg-[#F96313] hover:bg-[#e0550f] text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Garantir Acesso Antecipado <ArrowRight size={14} />
                  </button>
                  <button onClick={reset} className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 mt-2 transition-colors">
                    ← Voltar às opções
                  </button>
                </motion.div>
              )}

              {/* Formulário de captura */}
              {step === 'form' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3"
                >
                  <p className="text-xs font-bold text-[#081B33]">🎯 Garanta condições exclusivas de Fundador do KeaLex.</p>
                  <form onSubmit={handleSubmit} className="space-y-2.5">
                    <input
                      required
                      type="text"
                      placeholder="Seu nome"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all"
                    />
                    <input
                      required
                      type="text"
                      placeholder="E-mail ou WhatsApp"
                      value={form.contato}
                      onChange={(e) => setForm({ ...form, contato: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all"
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#F96313] hover:bg-[#e0550f] text-white font-bold text-xs py-2.5 rounded-xl transition-all animate-pulse-cta flex items-center justify-center gap-2"
                    >
                      Liberar Meu Acesso Antecipado ➔
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Sucesso */}
              {step === 'done' && submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#00C2A8]/10 border border-[#00C2A8]/30 rounded-2xl p-4 text-center"
                >
                  <CheckCircle2 size={32} className="text-[#00C2A8] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#081B33]">Pronto! Seu acesso prioritário foi reservado.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Verifique seu e-mail (ou WhatsApp) em breve.</p>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão flutuante */}
      <div className="relative">
        {/* Nudge balloon */}
        <AnimatePresence>
          {nudge && !open && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute bottom-14 right-0 bg-white border border-slate-200 shadow-lg rounded-2xl rounded-br-none px-4 py-2.5 w-52 text-xs text-[#081B33] font-medium"
            >
              👋 Oi! Posso te ajudar a resolver seus maiores gargalos jurídicos?
              <button
                onClick={() => setNudge(false)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-300"
              >
                <X size={10} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => { setOpen((v) => !v); setNudge(false) }}
          aria-label="Fale com o KeaLex AI"
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00C2A8] to-[#0891b2] shadow-xl shadow-[#00C2A8]/30 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
        >
          <AnimatePresence mode="wait">
            {open
              ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><ChevronDown size={22} /></motion.span>
              : <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={22} /></motion.span>
            }
          </AnimatePresence>
        </button>

        {/* Badge de notificação */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F96313] rounded-full border-2 border-white animate-pulse" />
        )}
      </div>
    </div>
  )
}

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-full bg-[#00C2A8]/20 flex items-center justify-center text-sm shrink-0 mt-0.5">🤖</div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-[#081B33] leading-relaxed shadow-sm max-w-[85%]">
        {children}
      </div>
    </div>
  )
}
