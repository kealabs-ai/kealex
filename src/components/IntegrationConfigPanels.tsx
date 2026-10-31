import { useState } from 'react'
import { Plus, Server, Trash2, Database, ShieldCheck, CircleHelp } from 'lucide-react'
import { DataCard } from './Cards'
import { Button, Input } from './UI'

type McpServer = { id: number; nome: string; url: string; transporte: string; ativo: boolean }

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'

export function McpConfigPanel() {
  const [servers, setServers] = useState<McpServer[]>([{ id: 1, nome: '', url: '', transporte: 'streamable-http', ativo: true }])
  const [nextId, setNextId] = useState(2)
  const [token, setToken] = useState('')

  const updateServer = (id: number, change: Partial<McpServer>) => {
    setServers((current) => current.map((server) => server.id === id ? { ...server, ...change } : server))
  }

  return (
    <div className="space-y-5">
      <DataCard className="p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><Server size={21} /></span>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Servidores MCP</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Cadastre os servidores que disponibilizam ferramentas para os recursos de IA do Kealex.</p>
          </div>
        </div>

        <div className="space-y-4">
          {servers.map((server, index) => (
            <section key={server.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Servidor {index + 1}</h3>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <input type="checkbox" checked={server.ativo} onChange={(event) => updateServer(server.id, { ativo: event.target.checked })} className="h-4 w-4 accent-teal-600" />
                    Ativo
                  </label>
                  {servers.length > 1 && <button type="button" onClick={() => setServers((current) => current.filter((item) => item.id !== server.id))} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" aria-label={`Remover servidor ${index + 1}`}><Trash2 size={16} /></button>}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Nome de identificação" value={server.nome} onChange={(event) => updateServer(server.id, { nome: event.target.value })} placeholder="Ex.: Ferramentas internas" />
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Transporte
                  <select value={server.transporte} onChange={(event) => updateServer(server.id, { transporte: event.target.value })} className={`${inputClass} mt-1`}>
                    <option value="streamable-http">Streamable HTTP</option>
                    <option value="sse">SSE</option>
                  </select>
                </label>
                <div className="md:col-span-2"><Input label="URL do servidor" type="url" value={server.url} onChange={(event) => updateServer(server.id, { url: event.target.value })} placeholder="https://mcp.exemplo.com/mcp" /></div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-4">
          <Button variant="secondary" icon={<Plus size={15} />} onClick={() => { setServers((current) => [...current, { id: nextId, nome: '', url: '', transporte: 'streamable-http', ativo: true }]); setNextId((id) => id + 1) }}>Adicionar servidor</Button>
        </div>
      </DataCard>

      <DataCard className="p-6">
        <div className="mb-4 flex items-start gap-3">
          <ShieldCheck size={19} className="mt-0.5 text-teal-600" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Autenticação</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Token opcional enviado ao servidor MCP. Use credenciais de escopo limitado.</p>
          </div>
        </div>
        <Input label="Token de acesso" type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Informe o token do servidor" autoComplete="new-password" />
      </DataCard>

      <p className="flex items-start gap-2 px-1 text-xs leading-5 text-slate-500 dark:text-slate-400"><CircleHelp size={15} className="mt-0.5 shrink-0" />Os campos desta tela ainda não são persistidos: o serviço de configurações não possui endpoint MCP conectado.</p>
    </div>
  )
}

export function NotebookLlmConfigPanel() {
  const [ativo, setAtivo] = useState(false)
  const [endpoint, setEndpoint] = useState('')
  const [notebookId, setNotebookId] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [modelo, setModelo] = useState('')

  return (
    <div className="space-y-5">
      <DataCard className="p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"><Database size={21} /></span>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Conexão Notebook LLM</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Defina os dados da conexão para consultar notebooks e fontes de conhecimento no fluxo de IA.</p>
          </div>
        </div>

        <label className="mb-5 flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/70">
          <span><strong className="block text-slate-800 dark:text-slate-100">Ativar integração</strong><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Habilita o uso da conexão pelos recursos de IA.</span></span>
          <input type="checkbox" checked={ativo} onChange={(event) => setAtivo(event.target.checked)} className="h-5 w-5 accent-teal-600" />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><Input label="Endpoint da integração" type="url" value={endpoint} onChange={(event) => setEndpoint(event.target.value)} placeholder="https://api.exemplo.com/v1" disabled={!ativo} /></div>
          <Input label="Identificador do notebook" value={notebookId} onChange={(event) => setNotebookId(event.target.value)} placeholder="ID ou referência do notebook" disabled={!ativo} />
          <Input label="Modelo LLM" value={modelo} onChange={(event) => setModelo(event.target.value)} placeholder="Ex.: modelo configurado no serviço" disabled={!ativo} />
          <div className="md:col-span-2"><Input label="Chave de API" type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Informe a chave do serviço" autoComplete="new-password" disabled={!ativo} /></div>
        </div>
      </DataCard>

      <DataCard className="flex items-start gap-3 border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
        <CircleHelp size={17} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300" />
        <p className="text-xs leading-5 text-amber-900 dark:text-amber-200">Informe os dados do provedor ou gateway autorizado pela organização. A API oficial disponível para a plataforma deve ser confirmada antes de habilitar consultas.</p>
      </DataCard>

      <p className="flex items-start gap-2 px-1 text-xs leading-5 text-slate-500 dark:text-slate-400"><CircleHelp size={15} className="mt-0.5 shrink-0" />Os campos desta tela ainda não são persistidos: o serviço de configurações não possui endpoint Notebook LLM conectado.</p>
    </div>
  )
}
