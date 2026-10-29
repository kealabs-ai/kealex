import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Check, Copy, FileText, LoaderCircle, MessageSquareText, Paperclip, Plus, Send, ShieldCheck, Trash2, UploadCloud, X, RotateCcw } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { MarkdownRenderer } from '../components/MarkdownRenderer'
import { Button } from '../components/UI'
import { useToast } from '../components/Toast'
import { analiseDocumentosApi, type AnaliseConversa } from '../api/analiseDocumentos'

const ACCEPTED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'md']
const MAX_FILE_SIZE = 10 * 1024 * 1024
const QUICK_ACTIONS = [
  { label: 'Resumir documento', prompt: 'Faça um resumo estruturado do documento, destacando objetivo, partes, pontos principais e conclusão. Cite as referências documentais que conseguir localizar.' },
  { label: 'Identificar riscos', prompt: 'Analise os documentos anexados e destaque possíveis riscos, ambiguidades e pontos que merecem revisão. Separe fatos do documento de interpretações e cite as referências disponíveis.' },
  { label: 'Extrair prazos', prompt: 'Liste as datas, prazos, vigências e condições temporais encontrados nos documentos. Informe a referência documental de cada item e sinalize quando não houver prazo expresso.' },
  { label: 'Analisar obrigações', prompt: 'Organize os direitos, deveres e responsabilidades de cada parte conforme os documentos. Cite cláusulas, páginas ou seções quando disponíveis.' },
  { label: 'Cláusulas críticas', prompt: 'Identifique cláusulas sobre multa, rescisão, garantias e limitação de responsabilidade. Explique os pontos de atenção sem apresentar conclusões jurídicas definitivas.' },
  { label: 'Comparar documentos', prompt: 'Compare os documentos anexados e apresente diferenças, divergências e informações incompatíveis, citando a origem de cada apontamento.' },
]

function errorDetail(error: unknown) {
  const response = error as { response?: { data?: { detail?: string; message?: string } } }
  return response?.response?.data?.detail ?? response?.response?.data?.message ?? 'Não foi possível concluir a operação. Tente novamente.'
}

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLocaleLowerCase('pt-BR') ?? ''
}

export function AnaliseDocumentosPage() {
  const queryClient = useQueryClient()
  const { error: toastError, success } = useToast()
  const [conversationId, setConversationId] = useState('')
  const [input, setInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [creating, setCreating] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [pageError, setPageError] = useState('')
  const [retryPrompt, setRetryPrompt] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const conversationsQuery = useQuery({
    queryKey: ['analise-documentos', 'conversas'],
    queryFn: analiseDocumentosApi.list,
  })
  const conversationQuery = useQuery({
    queryKey: ['analise-documentos', 'conversa', conversationId],
    queryFn: () => analiseDocumentosApi.get(conversationId),
    enabled: Boolean(conversationId),
  })
  const conversations = conversationsQuery.data ?? []
  const conversation = conversationQuery.data

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [conversation?.mensagens, sending])

  async function createConversation() {
    setCreating(true)
    setPageError('')
    try {
      const created = await analiseDocumentosApi.create()
      setConversationId(created.id)
      await queryClient.invalidateQueries({ queryKey: ['analise-documentos', 'conversas'] })
      return created.id
    } catch (error) {
      setPageError(errorDetail(error))
      return ''
    } finally {
      setCreating(false)
    }
  }

  async function ensureConversation() {
    if (conversationId) return conversationId
    return createConversation()
  }

  async function uploadFiles(files: FileList | File[]) {
    const selected = Array.from(files)
    if (!selected.length) return
    const allowedFiles = selected.filter((file) => {
      const extension = fileExtension(file.name)
      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        toastError(`${file.name}: formato não suportado. Use PDF, DOC, DOCX, TXT ou Markdown.`)
        return false
      }
      if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
        toastError(`${file.name}: o arquivo deve ter até 10 MB.`)
        return false
      }
      return true
    })
    if (!allowedFiles.length) return

    setUploading(true)
    const id = await ensureConversation()
    if (!id) {
      setUploading(false)
      return
    }
    setPageError('')
    try {
      for (const file of allowedFiles) await analiseDocumentosApi.upload(id, file)
      await queryClient.invalidateQueries({ queryKey: ['analise-documentos', 'conversa', id] })
      await queryClient.invalidateQueries({ queryKey: ['analise-documentos', 'conversas'] })
      success(allowedFiles.length === 1 ? 'Documento processado e anexado à conversa.' : 'Documentos processados e anexados à conversa.')
    } catch (error) {
      setPageError(errorDetail(error))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void uploadFiles(event.target.files)
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (event.dataTransfer.files) void uploadFiles(event.dataTransfer.files)
  }

  async function sendMessage(content = input) {
    const text = content.trim()
    if (!text || sending) return
    if (!conversation?.documentos.length) {
      setPageError('Anexe ao menos um documento antes de iniciar a análise.')
      return
    }
    const id = await ensureConversation()
    if (!id) return
    setSending(true)
    setPageError('')
    setRetryPrompt(text)
    setInput('')
    try {
      await analiseDocumentosApi.send(id, text)
      await queryClient.invalidateQueries({ queryKey: ['analise-documentos', 'conversa', id] })
      await queryClient.invalidateQueries({ queryKey: ['analise-documentos', 'conversas'] })
    } catch (error) {
      setPageError(errorDetail(error))
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  async function removeDocument(documentId: string) {
    if (!conversationId) return
    try {
      await analiseDocumentosApi.removeDocumento(conversationId, documentId)
      await queryClient.invalidateQueries({ queryKey: ['analise-documentos', 'conversa', conversationId] })
      await queryClient.invalidateQueries({ queryKey: ['analise-documentos', 'conversas'] })
    } catch (error) {
      setPageError(errorDetail(error))
    }
  }

  async function removeConversation(id: string) {
    if (!window.confirm('Excluir esta análise, os documentos e as mensagens associados?')) return
    try {
      await analiseDocumentosApi.remove(id)
      if (id === conversationId) setConversationId('')
      await queryClient.invalidateQueries({ queryKey: ['analise-documentos', 'conversas'] })
      success('Análise excluída.')
    } catch (error) {
      toastError(errorDetail(error))
    }
  }

  function newAnalysis() {
    setConversationId('')
    setPageError('')
    setInput('')
  }

  async function copyAnswer(id: string, content: string) {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(''), 1800)
    } catch {
      toastError('Não foi possível copiar a resposta.')
    }
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage()
  }

  return (
    <div className="kea-process-page kea-ai-page kea-document-analysis-page">
      <TopBar title="" hideModuleBar />
      <div className="kea-process-content kea-document-analysis-content">
        <header className="kea-ai-page-heading">
          <div className="min-w-0">
            <h1>Análise de Documentos</h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Converse com o Kealex AI sobre os arquivos anexados.</p>
          </div>
          <div className="kea-ai-heading-actions">
            <button type="button" className="kea-ai-new-chat" onClick={newAnalysis} disabled={creating}>
              {creating ? <LoaderCircle size={14} className="animate-spin" /> : <RotateCcw size={14} />}
              Nova análise
            </button>
          </div>
        </header>

        <div className="kea-ai-workspace kea-document-analysis-workspace flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row">
          <aside className="kea-document-analysis-history flex min-h-0 w-full shrink-0 flex-col p-3 sm:w-60 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2 px-1">
              <h2 className="text-sm font-bold text-[#102B46] dark:text-white">Análises anteriores</h2>
              <button type="button" onClick={newAnalysis} className="rounded-lg p-2 text-[#087E96] transition hover:bg-[#087E96]/10" aria-label="Iniciar nova análise"><Plus size={17} /></button>
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {conversationsQuery.isLoading ? <p className="px-2 py-4 text-xs text-slate-500">Carregando análises…</p> : null}
              {!conversationsQuery.isLoading && !conversations.length && <p className="px-2 py-4 text-xs leading-5 text-slate-500 dark:text-slate-400">Suas análises serão listadas aqui.</p>}
              {conversations.map((item) => <ConversationItem key={item.id} item={item} active={item.id === conversationId} onSelect={() => { setConversationId(item.id); setPageError('') }} onDelete={() => void removeConversation(item.id)} />)}
            </div>
          </aside>

          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#087E96]/10 text-[#087E96] dark:bg-[#20B987]/15 dark:text-[#20B987]"><MessageSquareText size={19} /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-[#102B46] dark:text-white">{conversation?.titulo ?? 'Nova análise documental'}</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">PDF (inclusive digitalizado), Word (DOC e DOCX), texto e Markdown · até 10 MB por arquivo</p>
                </div>
              </div>
              <div
                onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`mt-4 rounded-xl border border-dashed p-4 transition ${dragging ? 'border-[#087E96] bg-[#087E96]/5' : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60'}`}
              >
                <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
                  <div className="flex items-center gap-3"><UploadCloud size={20} className="text-[#087E96]" /><div><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Anexe documentos à conversa</p><p className="text-xs text-slate-500 dark:text-slate-400">Arraste os arquivos para cá ou selecione no dispositivo.</p></div></div>
                  <Button variant="secondary" icon={uploading ? <LoaderCircle size={15} className="animate-spin" /> : <Paperclip size={15} />} onClick={() => fileInputRef.current?.click()} disabled={uploading}>{uploading ? 'Processando…' : 'Selecionar arquivos'}</Button>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown" className="hidden" onChange={onFileChange} />
                </div>
                {conversation?.documentos.length ? <div className="mt-3 flex flex-wrap gap-2">{conversation.documentos.map((document) => <span key={document.id} className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"><FileText size={14} className="shrink-0 text-[#087E96]" /><span className="truncate">{document.nome}</span><span className="shrink-0 text-slate-400">{formatBytes(document.tamanhoBytes)}{document.paginas ? ` · ${document.paginas} pág.` : ''}</span><button type="button" onClick={() => void removeDocument(document.id)} disabled={uploading || sending} className="rounded p-0.5 text-slate-400 hover:text-rose-600" aria-label={`Remover ${document.nome}`}><X size={14} /></button></span>)}</div> : null}
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" aria-live="polite">
              {conversationQuery.isLoading && <div className="flex justify-center py-12"><LoaderCircle className="animate-spin text-[#087E96]" /></div>}
              {!conversationQuery.isLoading && !conversation?.mensagens.length && <WelcomeState hasDocuments={Boolean(conversation?.documentos.length)} onPrompt={(prompt) => void sendMessage(prompt)} onUpload={() => fileInputRef.current?.click()} />}
              {conversation?.mensagens.map((message) => <Message key={message.id} message={message} copied={copiedId === message.id} onCopy={() => void copyAnswer(message.id, message.content)} />)}
              {sending && <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin text-[#087E96]" />Analisando o documento…</div>}
              <div ref={bottomRef} />
            </div>

            {pageError && <div role="alert" className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span className="flex-1">{pageError}</span>{retryPrompt && !sending && <button type="button" onClick={() => void sendMessage(retryPrompt)} className="shrink-0 font-semibold underline">Tentar novamente</button>}</div>}

            <form onSubmit={submitMessage} className="chat-input-bar shrink-0 border-t p-3 backdrop-blur sm:p-4">
              <label htmlFor="document-analysis-prompt" className="sr-only">Pergunte sobre os documentos</label>
              <div className="chat-input-box relative mx-auto flex max-w-3xl items-end gap-2 rounded-2xl px-3 py-2 transition-all sm:gap-3 sm:px-4 sm:py-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading || sending} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#087E96] disabled:opacity-50 dark:hover:bg-slate-800" aria-label="Anexar documentos"><Paperclip size={18} /></button>
                <textarea id="document-analysis-prompt" ref={inputRef} rows={1} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage() } }} placeholder={conversation?.documentos.length ? 'Pergunte algo sobre os documentos…' : 'Anexe um documento para iniciar a análise…'} disabled={sending || uploading} className="max-h-36 min-h-10 flex-1 resize-y border-0 bg-transparent px-1 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:text-slate-100" />
                <button type="submit" disabled={!input.trim() || sending || uploading} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#087E96] text-white transition hover:bg-[#066b80] disabled:cursor-not-allowed disabled:opacity-45" aria-label="Enviar mensagem">{sending ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}</button>
              </div>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] leading-4 text-slate-400"><ShieldCheck size={12} />A análise é um apoio ao trabalho jurídico e considera apenas o conteúdo processado dos arquivos anexados.</p>
            </form>
          </main>
        </div>
      </div>
    </div>
  )
}

function ConversationItem({ item, active, onSelect, onDelete }: { item: AnaliseConversa; active: boolean; onSelect: () => void; onDelete: () => void }) {
  return <div className={`group flex items-center gap-1 rounded-xl border p-2 transition ${active ? 'border-[#087E96]/30 bg-[#087E96]/5' : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/50'}`}>
    <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left"><span className="block truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{item.titulo || 'Nova análise documental'}</span><span className="mt-1 block text-[10px] text-slate-500">{new Date(item.updatedAt).toLocaleDateString('pt-BR')} · {item.documentos.length} doc. · {item.mensagens.length} mensagens</span></button>
    <button type="button" onClick={onDelete} className="rounded-lg p-1.5 text-slate-400 opacity-100 hover:bg-rose-50 hover:text-rose-600 sm:opacity-0 sm:group-hover:opacity-100" aria-label={`Excluir análise ${item.titulo}`}><Trash2 size={14} /></button>
  </div>
}

function WelcomeState({ hasDocuments, onPrompt, onUpload }: { hasDocuments: boolean; onPrompt: (prompt: string) => void; onUpload: () => void }) {
  return <div className="mx-auto flex max-w-2xl flex-col items-center py-8 text-center sm:py-12">
    <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#087E96]/10 text-[#087E96] dark:bg-[#20B987]/15 dark:text-[#20B987]"><MessageSquareText size={25} /></span>
    <h3 className="text-lg font-bold text-[#102B46] dark:text-white">{hasDocuments ? 'Como posso ajudar na análise?' : 'Comece anexando um documento'}</h3>
    <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">Resuma, esclareça cláusulas ou compare documentos. As respostas devem indicar quando não encontrarem a informação nos arquivos.</p>
    {!hasDocuments && <Button variant="secondary" icon={<Paperclip size={15} />} onClick={onUpload} className="mt-4">Anexar documento</Button>}
    {hasDocuments && <div className="mt-6 flex flex-wrap justify-center gap-2">{QUICK_ACTIONS.map((action) => <button key={action.label} type="button" onClick={() => onPrompt(action.prompt)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-[#087E96]/40 hover:text-[#087E96] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{action.label}</button>)}</div>}
  </div>
}

function Message({ message, copied, onCopy }: { message: AnaliseConversa['mensagens'][number]; copied: boolean; onCopy: () => void }) {
  const isUser = message.role === 'user'
  return <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
    <article className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[85%] ${isUser ? 'rounded-br-md bg-[#087E96] text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}>
      <p className={`mb-2 text-[10px] font-bold uppercase tracking-wide ${isUser ? 'text-white/75' : 'text-[#087E96] dark:text-[#20B987]'}`}>{isUser ? 'Você' : 'Kealex AI · Análise documental'}</p>
      {isUser ? <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p> : <div className="text-sm leading-6"><MarkdownRenderer content={message.content} /></div>}
      <div className={`mt-2 flex items-center justify-between gap-4 ${isUser ? 'text-white/60' : 'text-slate-400'}`}><time className="text-[10px]">{new Date(message.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</time>{!isUser && <button type="button" onClick={onCopy} className="inline-flex items-center gap-1 text-[10px] font-semibold hover:text-[#087E96]" aria-label="Copiar resposta">{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? 'Copiado' : 'Copiar'}</button>}</div>
    </article>
  </div>
}
