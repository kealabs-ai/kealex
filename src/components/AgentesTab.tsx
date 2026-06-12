import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, EyeOff, Bot, Globe, Lock, CheckCircle } from 'lucide-react'
import { DataCard } from './Cards'
import { Button, Input, Textarea, Select } from './UI'
import { Modal } from './Modal'
import { useAgentes, useCreateAgente, useUpdateAgente, useDeleteAgente } from '../hooks/useAgentes'
import type { AgenteIA, AIProvider } from '../types'

export function AgentesTab() {
  const { data: agentes = [], isLoading } = useAgentes()
  const createAgente = useCreateAgente()
  const updateAgente = useUpdateAgente()
  const deleteAgente = useDeleteAgente()

  const [modal, setModal] = useState<{ type: 'create' | 'edit'; agente?: AgenteIA } | null>(null)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<string | null>(null)

  const handleSave = async (data: Partial<AgenteIA>) => {
    if (modal?.type === 'edit' && modal.agente) {
      await updateAgente.mutateAsync({ id: modal.agente.id, data })
    } else {
      await createAgente.mutateAsync(data)
    }
    setSaved(modal?.agente?.id || 'new')
    setTimeout(() => setSaved(null), 2000)
    setModal(null)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agente?')) {
      await deleteAgente.mutateAsync(id)
    }
  }

  if (isLoading) {
    return (
      <DataCard className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </DataCard>
    )
  }

  return (
    <div className="space-y-6">
      <DataCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Agentes de IA</h2>
            <p className="text-xs text-gray-500 mt-1">Configure múltiplos agentes com diferentes modelos e comportamentos</p>
          </div>
          <Button icon={<Plus size={14} />} onClick={() => setModal({ type: 'create' })}>
            Novo Agente
          </Button>
        </div>

        {agentes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Bot size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhum agente configurado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agentes.map((agente) => (
              <motion.div
                key={agente.id}
                layout
                className="border border-gray-200 rounded-xl p-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      agente.provider === 'groq' ? 'bg-orange-100' : 'bg-indigo-100'
                    }`}>
                      <Bot size={18} className={agente.provider === 'groq' ? 'text-orange-600' : 'text-indigo-600'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{agente.nome}</h3>
                        {agente.publico ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                            <Globe size={10} /> Público
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            <Lock size={10} /> Privado
                          </span>
                        )}
                        {agente.ativo && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Ativo
                          </span>
                        )}
                      </div>
                      {agente.descricao && (
                        <p className="text-xs text-gray-500">{agente.descricao}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className={agente.provider === 'groq' ? 'text-orange-600 font-medium' : 'text-indigo-600 font-medium'}>
                          {agente.provider === 'groq' ? 'Groq' : 'Cerebras'}
                        </span>
                        <span>•</span>
                        <span>{agente.modelo}</span>
                        <span>•</span>
                        <span>{agente.max_tokens} tokens</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModal({ type: 'edit', agente })}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(agente.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="text-xs text-gray-400 mb-1">API Key</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-gray-50 px-3 py-2 rounded-lg font-mono">
                      {showKeys[agente.id] ? agente.api_key : '••••••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => setShowKeys(prev => ({ ...prev, [agente.id]: !prev[agente.id] }))}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showKeys[agente.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </DataCard>

      {modal && (
        <AgenteModal
          agente={modal.agente}
          onSave={handleSave}
          onClose={() => setModal(null)}
          isSaving={createAgente.isPending || updateAgente.isPending}
        />
      )}

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg"
        >
          <CheckCircle size={16} />
          <span className="text-sm font-medium">Agente salvo com sucesso!</span>
        </motion.div>
      )}
    </div>
  )
}

function AgenteModal({ 
  agente, 
  onSave, 
  onClose, 
  isSaving 
}: { 
  agente?: AgenteIA
  onSave: (data: Partial<AgenteIA>) => void
  onClose: () => void
  isSaving: boolean
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [form, setForm] = useState({
    nome: agente?.nome || '',
    descricao: agente?.descricao || '',
    provider: (agente?.provider || 'cerebras') as AIProvider,
    api_key: agente?.api_key || '',
    modelo: agente?.modelo || 'llama-3.3-70b',
    max_tokens: agente?.max_tokens || 8192,
    system_prompt: agente?.system_prompt || '',
    ativo: agente?.ativo ?? true,
    publico: agente?.publico ?? true,
  })

  const modelos = {
    cerebras: ['llama-3.3-70b', 'llama-3.1-70b', 'llama-3.1-8b'],
    groq: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant']
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.api_key) return
    onSave(form)
  }

  return (
    <Modal onClose={onClose} title={agente ? 'Editar Agente' : 'Novo Agente'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome e Descrição */}
        <div className="space-y-3">
          <Input
            label="Nome do Agente"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Ex: Assistente Jurídico Trabalhista"
            required
          />

          <Input
            label="Descrição (opcional)"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            placeholder="Breve descrição do agente"
          />
        </div>

        {/* Provider e Modelo em grid */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Provider"
            value={form.provider}
            onChange={(e) => setForm({ 
              ...form, 
              provider: e.target.value as AIProvider,
              modelo: e.target.value === 'groq' ? 'llama-3.3-70b-versatile' : 'llama-3.3-70b'
            })}
          >
            <option value="cerebras">Cerebras</option>
            <option value="groq">Groq</option>
          </Select>

          <Select
            label="Modelo"
            value={form.modelo}
            onChange={(e) => setForm({ ...form, modelo: e.target.value })}
          >
            {modelos[form.provider].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </div>

        {/* API Key */}
        <Input
          label="API Key"
          type="password"
          value={form.api_key}
          onChange={(e) => setForm({ ...form, api_key: e.target.value })}
          placeholder={form.provider === 'groq' ? 'gsk-...' : 'csk-...'}
          required
        />

        {/* Toggles compactos */}
        <div className="flex gap-2">
          <label className="flex-1 flex items-center justify-between p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-xs font-medium text-gray-900">Ativo</span>
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              className="w-4 h-4"
            />
          </label>

          <label className="flex-1 flex items-center justify-between p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-xs font-medium text-gray-900">Público</span>
            <input
              type="checkbox"
              checked={form.publico}
              onChange={(e) => setForm({ ...form, publico: e.target.checked })}
              className="w-4 h-4"
            />
          </label>
        </div>

        {/* Configurações Avançadas (Collapsible) */}
        <div className="border-t pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>Configurações Avançadas</span>
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 mt-3"
            >
              <Input
                label="Max Tokens"
                type="number"
                value={form.max_tokens}
                onChange={(e) => setForm({ ...form, max_tokens: parseInt(e.target.value) })}
              />

              <Textarea
                label="System Prompt (opcional)"
                value={form.system_prompt}
                onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                rows={3}
                placeholder="Deixe vazio para usar o prompt padrão..."
              />
            </motion.div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-3 border-t">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" loading={isSaving} className="flex-1">
            {agente ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
