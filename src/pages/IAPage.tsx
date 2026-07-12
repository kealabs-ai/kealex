import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, RotateCcw, Copy, Check, Bot, Lightbulb, ChevronRight, AlertCircle, ChevronDown, Download, Edit3 } from 'lucide-react'
import { sendMessage, type ChatMessage, type AIConfig } from '../api/ai'
import { MarkdownRenderer } from '../components/MarkdownRenderer'
import { useAuth } from '../context/AuthContext'
import { useAgentesPublicos } from '../hooks/useAgentes'
import { useConfigIaAtiva } from '../hooks/useConfiguracoes'
import { gerarDocumentoWordDoChat } from '../utils/documentGenerator'
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

  const [generatingDocx, setGeneratingDocx] = useState(false)

  const handleGerarDocx = async () => {
    try {
      setGeneratingDocx(true)
      const titulo = `Documento_${new Date().toISOString().split('T')[0]}`
      await gerarDocumentoWordDoChat(titulo, messages, user?.nome)
    } catch (err) {
      console.error('Erro ao gerar documento:', err)
    } finally {
      setGeneratingDocx(false)
    }
  }

  const clearChat = () => { setMessages([]); setError(null) }

  const initials = user?.nome?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? '?'

  return (
    <div className="flex flex-col h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(129,140,248,0.16),_transparent_35%),linear-gradient(135deg,_#f8fbff_0%,_#f4f7ff_50%,_#f9f7ff_100%)] dark:bg-transparent">
      <TopBar
        icon={Sparkles}
        title="Kealex AI Hub"
        subtitle="Workspace Inteligente — Chat + Editor de Documentos"
        actions={
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <RotateCcw size={13} /> Nova conversa
              </button>
            )}
            {agentesPublicos.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowSeletor(!showSeletor)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-colors"
                >
                  <Bot size={14} className={agenteAtivo ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {agenteAtivo?.nome || 'Padrão'}
                  </span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>
                {showSeletor && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => { setAgenteAtivo(null); setShowSeletor(false) }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          !agenteAtivo ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="font-medium">Agente Padrão</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {configPadrao?.modelo || 'Configuração padrão'}
                        </div>
                      </button>
                      <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                      {agentesPublicos.filter(a => a.ativo).map((agente) => (
                        <button
                          key={agente.id}
                          onClick={() => { setAgenteAtivo(agente); setShowSeletor(false) }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            agenteAtivo?.id === agente.id ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div className="font-medium">{agente.nome}</div>
                          {agente.descricao && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{agente.descricao}</div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-1">
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
            <div className="hidden sm:block px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {config?.modelo || 'Llama 3.3'}
              </span>
            </div>
          </div>
        }
      />

      {/* Split-screen workspace */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Left: Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {messages.length === 0 ? (
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* welcome */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-sky-200 dark:shadow-sky-950/40">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Olá, {user?.nome?.split(' ')[0]}!</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                    Sou o <strong className="text-indigo-600 dark:text-indigo-400">Kealex AI</strong>, seu assistente jurídico inteligente. Posso ajudar com análise de casos, prazos, legislação e muito mais.
                  </p>
                </div>

                {!hasConfig && !configLoading && !agentesLoading && (
                  <motion.div
                    className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AlertCircle size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Configure um Agente de IA</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        {configError
                          ? 'Nenhuma configuração de IA ativa encontrada. Entre em contato com o administrador.'
                          : 'Aguarde a configuração do agente pelo administrador.'}
                      </p>
                    </div>
                  </motion.div>
                )}

                {hasConfig && (
                  <motion.div
                    className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        {agenteAtivo ? `Usando: ${agenteAtivo.nome}` : `Conectado ao ${config.provider === 'groq' ? 'Groq' : 'Cerebras'}`}
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                        Modelo: {config.modelo} • Max Tokens: {config.max_tokens}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* quick actions */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={14} className="text-indigo-400" />
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ações rápidas</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((a) => (
                      <button
                        key={a}
                        onClick={() => { setInput(a + ' '); textareaRef.current?.focus() }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:border-sky-300 dark:hover:border-sky-500/30 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-sky-950/20 transition-all"
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
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sugestões</p>
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
                            ? 'bg-white/90 dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-700/70 hover:border-sky-200 dark:hover:border-sky-500/30 hover:shadow-sm hover:shadow-sky-100 dark:hover:shadow-sky-950/40'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-xl shrink-0">{s.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{s.label}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">{s.prompt}</p>
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
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md shadow-sky-200 dark:shadow-sky-950/40 mt-1">
                          <Bot size={15} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-white mt-1">
                          {initials}
                        </div>
                      )}

                      {/* bubble */}
                      <div className={`group relative max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-lg shadow-sky-200/70 dark:shadow-sky-950/35'
                            : 'bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm rounded-tl-sm backdrop-blur-sm'
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
                          <span className="text-[10px] text-slate-400">
                            {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.role === 'assistant' && msg.content && (
                            <button
                              onClick={() => copyMessage(msg.id, msg.content)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
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
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-500/20 rounded-2xl p-4">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* input area */}
          <div className="shrink-0 bg-white/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-indigo-950/40 p-4 backdrop-blur">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-end gap-3 bg-gradient-to-r from-slate-50 via-sky-50/60 to-violet-50/60 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 border border-slate-200/80 dark:border-slate-700 rounded-2xl px-4 py-3 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 dark:focus-within:ring-sky-950/50 transition-all shadow-sm">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); autoResize() }}
                  onKeyDown={handleKeyDown}
                  placeholder="Faça uma pergunta jurídica... (Enter para enviar, Shift+Enter para nova linha)"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none leading-relaxed"
                  style={{ maxHeight: 160 }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || streaming || !hasConfig}
                  className="shrink-0 w-9 h-9 flex items-center justify-center bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-600 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-sky-200/70 dark:shadow-sky-950/35 transition-opacity"
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
              <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                Kealex AI pode cometer erros. Consulte sempre um advogado para casos específicos.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Document Editor */}
        <div className="hidden lg:flex lg:w-[500px] flex-col bg-gradient-to-b from-slate-50/80 via-sky-50/50 to-violet-50/40 dark:from-slate-900/70 dark:via-slate-900/60 dark:to-slate-950/80 border-l border-slate-200/80 dark:border-indigo-950/40">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
            {messages.length === 0 ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100 dark:from-sky-950/70 dark:to-violet-950/60 flex items-center justify-center mx-auto mb-3">
                  <Edit3 size={20} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Editor de Documentos</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Inicie uma conversa para gerar conteúdo</p>
              </div>
            ) : (
              <div className="w-full max-w-sm">
                {/* Document preview */}
                <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-[0_20px_60px_-20px_rgba(79,70,229,0.25)] p-8 min-h-[600px] border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-sm">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {messages
                      .filter((m) => m.role === 'assistant')
                      .map((m) => (
                        <div key={m.id} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words font-sans">
                          {m.content.slice(0, 2000)}
                          {m.content.length > 2000 && '...'}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Document actions */}
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl transition-all">
                    <Copy size={12} /> Copiar
                  </button>
                  <button
                    onClick={handleGerarDocx}
                    disabled={generatingDocx || messages.filter((m) => m.role === 'assistant').length === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-sky-600/25"
                  >
                    {generatingDocx ? (
                      <>
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Download size={12} /> .docx
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
