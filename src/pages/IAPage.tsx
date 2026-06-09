import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, RotateCcw, Copy, Check, Bot, Lightbulb, ChevronRight, AlertCircle, ChevronDown } from 'lucide-react'
import { sendMessage, type ChatMessage, type AIConfig } from '../api/ai'
import { MarkdownRenderer } from '../components/MarkdownRenderer'
import { useAuth } from '../context/AuthContext'
import { useAgentesPublicos } from '../hooks/useAgentes'
import { useConfigIaAtiva } from '../hooks/useConfiguracoes'
import { TopBar } from '../components/TopBar'
import type { AgenteIA } from '../types'

const SUGGESTED_PROMPTS = [
  { icon: '⚖️', label: 'Prazos processuais', prompt: 'Quais são os principais prazos processuais no CPC para contestação, recurso de apelação e embargos de declaração?' },
  { icon: '📋', label: 'Petição inicial', prompt: 'Quais são os requisitos obrigatórios de uma petição inicial conforme o art. 319 do CPC?' },
  { icon: '💼', label: 'Contrato de honorários', prompt: 'Como deve ser estruturado um contrato de honorários advocatícios? Quais cláusulas são essenciais?' },
  { icon: '🏛️', label: 'Recurso de apelação', prompt: 'Explique o procedimento e os requisitos para interpor recurso de apelação no processo civil brasileiro.' },
  { icon: '👷', label: 'Rescisão trabalhista', prompt: 'Quais são os direitos do trabalhador em caso de rescisão sem justa causa? Calcule as verbas rescisórias.' },
  { icon: '🏠', label: 'Usucapião', prompt: 'Explique os tipos de usucapião no direito brasileiro, seus requisitos e prazos para cada modalidade.' },
  { icon: '📜', label: 'Habeas corpus', prompt: 'Quando cabe habeas corpus? Explique o procedimento e os casos de cabimento conforme a jurisprudência atual.' },
  { icon: '💰', label: 'Execução fiscal', prompt: 'Como funciona o processo de execução fiscal? Quais são os meios de defesa do executado?' },
]

const QUICK_ACTIONS = [
  'Analise este contrato:',
  'Redija uma petição para:',
  'Qual o prazo para:',
  'Cite jurisprudência sobre:',
  'Explique o art.',
]

function genId() { return Math.random().toString(36).slice(2) }

export function IAPage() {
  const { user } = useAuth()
  const { data: configPadrao, isLoading: configLoading, error: configError } = useConfigIaAtiva()
  const { data: agentesPublicos = [], isLoading: agentesLoading } = useAgentesPublicos()
  
  const [agenteAtivo, setAgenteAtivo] = useState<AgenteIA | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [showSeletor, setShowSeletor] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<boolean>(false)

  const config = agenteAtivo || configPadrao
  const apiKey = config?.api_key
  const hasConfig = !!(config && apiKey && config.ativo)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const handleSend = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || streaming || !hasConfig) return

    setError(null)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const userMsg: ChatMessage = { id: genId(), role: 'user', content, timestamp: new Date() }
    const assistantId = genId()
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setStreaming(true)
    abortRef.current = false

    const aiConfig: AIConfig = {
      provider: config!.provider as any,
      apiKey: apiKey!,
      modelo: config!.modelo,
      systemPrompt: config!.system_prompt || undefined,
    }

    try {
      await sendMessage([...messages, userMsg], aiConfig, (chunk) => {
        if (abortRef.current) return
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
        )
      })
    } catch (err: any) {
      const msg = err?.message?.includes('API key') || err?.message?.includes('401')
        ? `Chave da API ${config?.provider === 'groq' ? 'Groq' : 'Cerebras'} inválida. Verifique as configurações.`
        : 'Erro ao conectar com a IA. Verifique sua configuração.'
      setError(msg)
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
    } finally {
      setStreaming(false)
    }
  }, [input, messages, streaming, hasConfig, config, apiKey])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const clearChat = () => { setMessages([]); setError(null) }

  const initials = user?.nome?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?'

  return (
    <div className="flex flex-col h-screen bg-gray-50">
        <TopBar
          icon={Sparkles}
          title="Kealex AI"
          subtitle="Advogado Inteligente"
          actions={
            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <RotateCcw size={13} /> Nova conversa
                </button>
              )}
              {agentesPublicos.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowSeletor(!showSeletor)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
                  >
                    <Bot size={14} className={agenteAtivo ? 'text-indigo-600' : 'text-gray-400'} />
                    <span className="text-xs font-medium text-gray-700">
                      {agenteAtivo?.nome || 'Padrão'}
                    </span>
                    <ChevronDown size={12} className="text-gray-400" />
                  </button>
                  {showSeletor && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => { setAgenteAtivo(null); setShowSeletor(false) }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            !agenteAtivo ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium">Agente Padrão</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {configPadrao?.modelo || 'Configuração padrão'}
                          </div>
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        {agentesPublicos.filter(a => a.ativo).map((agente) => (
                          <button
                            key={agente.id}
                            onClick={() => { setAgenteAtivo(agente); setShowSeletor(false) }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              agenteAtivo?.id === agente.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="font-medium">{agente.nome}</div>
                            {agente.descricao && (
                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{agente.descricao}</div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                              <span className={agente.provider === 'groq' ? 'text-orange-600' : 'text-indigo-600'}>
                                {agente.provider === 'groq' ? 'Groq' : 'Cerebras'}
                              </span>
                              <span>•</span>
                              <span>{agente.modelo}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="hidden sm:block px-3 py-1.5 bg-indigo-50 rounded-xl">
                <span className="text-xs font-semibold text-indigo-600">
                  {config?.modelo || 'Llama 3.3'}
                </span>
              </div>
            </div>
          }
        />

      {/* messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* welcome */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Olá, {user?.nome?.split(' ')[0]}!</h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Sou o <strong className="text-indigo-600">Kealex AI</strong>, seu assistente jurídico inteligente. Posso ajudar com análise de casos, prazos, legislação e muito mais.
              </p>
            </div>

            {!hasConfig && !configLoading && !agentesLoading && (
              <motion.div
                className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Configure um Agente de IA</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {configError 
                      ? 'Nenhuma configuração de IA ativa encontrada. Entre em contato com o administrador.'
                      : 'Aguarde a configuração do agente pelo administrador.'}
                  </p>
                </div>
              </motion.div>
            )}

            {hasConfig && (
              <motion.div
                className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    {agenteAtivo ? `Usando: ${agenteAtivo.nome}` : `Conectado ao ${config.provider === 'groq' ? 'Groq' : 'Cerebras'}`}
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Modelo: {config.modelo} • Max Tokens: {config.max_tokens}
                  </p>
                </div>
              </motion.div>
            )}

            {/* quick actions */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-indigo-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações rápidas</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setInput(a + ' '); textareaRef.current?.focus() }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    {a} <ChevronRight size={11} />
                  </button>
                ))}
              </div>
            </div>

            {/* suggested prompts */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-indigo-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sugestões</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTED_PROMPTS.map((s) => (
                  <motion.button
                    key={s.label}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSend(s.prompt)}
                    disabled={!hasConfig}
                    className={`flex items-start gap-3 p-3.5 border rounded-2xl text-left transition-all group ${
                      hasConfig
                        ? 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-sm hover:shadow-indigo-50'
                        : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-xl shrink-0">{s.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 group-hover:text-indigo-700">{s.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{s.prompt}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* avatar */}
                  {msg.role === 'assistant' ? (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200 mt-1">
                      <Bot size={15} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 text-xs font-bold text-white mt-1">
                      {initials}
                    </div>
                  )}

                  {/* bubble */}
                  <div className={`group relative max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-tr-sm'
                        : 'bg-white border border-gray-100 shadow-sm rounded-tl-sm'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      ) : msg.content === '' ? (
                        <div className="flex items-center gap-1.5 py-1">
                          {[0, 0.15, 0.3].map((d) => (
                            <motion.div
                              key={d}
                              className="w-2 h-2 bg-indigo-400 rounded-full"
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                            />
                          ))}
                        </div>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </div>

                    {/* actions */}
                    <div className={`flex items-center gap-2 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[10px] text-gray-400">
                        {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && msg.content && (
                        <button
                          onClick={() => copyMessage(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          {copied === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* error */}
        {error && (
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input area */}
      <div className="shrink-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize() }}
              onKeyDown={handleKeyDown}
              placeholder="Faça uma pergunta jurídica... (Enter para enviar, Shift+Enter para nova linha)"
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none leading-relaxed"
              style={{ maxHeight: 160 }}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSend()}
              disabled={!input.trim() || streaming || !hasConfig}
              className="shrink-0 w-9 h-9 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition-opacity"
            >
              {streaming ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <Send size={15} />
              )}
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2">
            Kealex AI pode cometer erros. Consulte sempre um advogado para casos específicos.
          </p>
        </div>
      </div>
    </div>
  )
}
