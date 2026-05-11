import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Database, Cloud, Bot, Users, Bell, Shield, Save, CheckCircle, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { Button, Input, Textarea } from '../components/UI'
import { DataCard } from '../components/Cards'
import { CEREBRAS_MODELS, GROQ_MODELS, type AIProvider } from '../api/ai'
import { useConfigIa, useSaveConfigIa } from '../hooks/useConfiguracoes'
import { Topbar } from '../components/TopBar'

type Tab = 'geral' | 'cdn' | 'database' | 'ia' | 'usuarios' | 'seguranca' | 'notificacoes'

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'geral', label: 'Geral', icon: Settings },
  { id: 'cdn', label: 'CDN & Arquivos', icon: Cloud },
  { id: 'database', label: 'Banco de Dados', icon: Database },
  { id: 'ia', label: 'Agentes IA', icon: Bot },
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
]

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ia')

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Topbar 
        title="Configurações do Sistema" 
        subtitle="Gerencie todas as configurações da plataforma" 
        icon={Settings} 
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex gap-6">
          <div className="w-56 shrink-0">
            <DataCard className="p-2">
              <div className="space-y-0.5">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </DataCard>
          </div>

          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'ia' && <IATab />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

function IATab() {
  const { data: cfg, isLoading } = useConfigIa()
  const { mutateAsync: save, isPending: isSaving } = useSaveConfigIa()
  const [saved, setSaved] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [fields, setFields] = useState({
    provider:      'cerebras' as AIProvider,
    api_key:       '',
    modelo:        'llama-3.3-70b',
    max_tokens:    '8192',
    system_prompt: '',
    ativo:         true,
  })

  useEffect(() => {
    if (cfg) {
      console.log('[Admin IA] Configuração carregada:', {
        provider: cfg.provider,
        cerebras_key: cfg.cerebras_api_key ? 'Configurada' : 'Vazia',
        groq_key: cfg.groq_api_key ? 'Configurada' : 'Vazia',
        api_key: cfg.api_key ? 'Configurada' : 'Vazia',
        ativo: cfg.ativo
      })
      
      const provider = (cfg.provider || 'cerebras') as AIProvider
      const apiKey = provider === 'groq'
        ? (cfg.groq_api_key || cfg.api_key || '')
        : (cfg.cerebras_api_key || cfg.api_key || '')
      
      setFields({
        provider,
        api_key: apiKey,
        modelo: cfg.modelo || (provider === 'groq' ? 'llama-3.3-70b-versatile' : 'llama-3.3-70b'),
        max_tokens: String(cfg.max_tokens || 8192),
        system_prompt: cfg.system_prompt || '',
        ativo: cfg.ativo ?? true,
      })
    }
  }, [cfg])

  const handleProviderChange = (newProvider: AIProvider) => {
    console.log('[Admin IA] Trocando provider para:', newProvider)
    
    const apiKey = newProvider === 'groq'
      ? (cfg?.groq_api_key || '')
      : (cfg?.cerebras_api_key || '')
    
    const modelo = newProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'llama-3.3-70b'
    
    console.log('[Admin IA] API Key do novo provider:', apiKey ? 'Configurada' : 'Vazia')
    
    setFields(prev => ({
      ...prev,
      provider: newProvider,
      api_key: apiKey,
      modelo: modelo
    }))
  }

  const set = (k: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSave = async () => {
    const payload: any = {
      provider: fields.provider,
      modelo: fields.modelo,
      max_tokens: parseInt(fields.max_tokens),
      system_prompt: fields.system_prompt || null,
      ativo: fields.ativo,
    }
    
    if (fields.api_key) {
      if (fields.provider === 'groq') {
        payload.groq_api_key = fields.api_key
      } else {
        payload.cerebras_api_key = fields.api_key
      }
    }
    
    try {
      await save(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar configuração')
    }
  }

  const provider = fields.provider
  const models = provider === 'groq' ? GROQ_MODELS : CEREBRAS_MODELS
  const providerName = provider === 'groq' ? 'Groq' : 'Cerebras'
  const providerUrl = provider === 'groq' ? 'https://console.groq.com' : 'https://cloud.cerebras.ai'
  const keyPrefix = provider === 'groq' ? 'gsk-' : 'csk-'

  if (isLoading) {
    return (
      <DataCard className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Carregando configuração...</p>
          </div>
        </div>
      </DataCard>
    )
  }

  return (
    <DataCard className="p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Agentes IA — Configuração</h2>
          <a
            href={provider === 'groq' ? 'https://console.groq.com/docs/quickstart' : 'https://inference-docs.cerebras.ai/quickstart'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
          >
            Docs <ExternalLink size={11} />
          </a>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              Provider de IA
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleProviderChange('cerebras')}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  provider === 'cerebras'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${
                    provider === 'cerebras' ? 'bg-indigo-500' : 'bg-gray-300'
                  }`} />
                  <span className="font-semibold text-sm text-gray-900">Cerebras</span>
                </div>
                <p className="text-xs text-gray-500">Ultra-rápido, otimizado para inferência</p>
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange('groq')}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  provider === 'groq'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${
                    provider === 'groq' ? 'bg-orange-500' : 'bg-gray-300'
                  }`} />
                  <span className="font-semibold text-sm text-gray-900">Groq</span>
                </div>
                <p className="text-xs text-gray-500">Alta performance, modelos versáteis</p>
              </button>
            </div>
          </div>

          <div className={`p-4 border-2 rounded-xl space-y-3 ${
            provider === 'groq' ? 'bg-orange-50 border-orange-200' : 'bg-indigo-50 border-indigo-200'
          }`}>
            <div className="flex items-center justify-between">
              <p className={`text-xs font-semibold ${
                provider === 'groq' ? 'text-orange-900' : 'text-indigo-900'
              }`}>
                {providerName} — Credenciais
              </p>
              <a
                href={providerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs hover:underline ${
                  provider === 'groq' ? 'text-orange-700' : 'text-indigo-700'
                }`}
              >
                Obter chave →
              </a>
            </div>
            <div className="relative">
              <Input
                label="API Key"
                type={showApiKey ? 'text' : 'password'}
                placeholder={`${keyPrefix}...`}
                value={fields.api_key}
                onChange={set('api_key')}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-[30px] text-gray-400 hover:text-gray-600 transition-colors"
                title={showApiKey ? 'Ocultar API Key' : 'Mostrar API Key'}
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Configuração Ativa</p>
                <p className="text-xs text-gray-500">Apenas configurações ativas são usadas pelo Kealex AI</p>
              </div>
              <button
                type="button"
                onClick={() => setFields(prev => ({ ...prev, ativo: !prev.ativo }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  fields.ativo ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    fields.ativo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <p className={`text-xs ${
              provider === 'groq' ? 'text-orange-700' : 'text-indigo-700'
            }`}>
              Obtenha sua chave em{' '}
              <a href={providerUrl} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                {providerUrl.replace('https://', '')}
              </a>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
              Modelo
            </label>
            <select
              value={fields.modelo}
              onChange={set('modelo')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {provider === 'groq' 
                ? 'llama-3.3-70b-versatile — recomendado para tarefas jurídicas complexas'
                : 'llama-3.3-70b — balanço ideal entre velocidade e precisão'}
            </p>
          </div>

          <Input
            label="Max Tokens"
            type="number"
            value={fields.max_tokens}
            onChange={set('max_tokens')}
          />

          <Textarea
            label="System Prompt (Personalizado)"
            rows={6}
            value={fields.system_prompt}
            onChange={set('system_prompt')}
            placeholder="Deixe vazio para usar o prompt padrão otimizado para direito brasileiro..."
          />
          <p className="text-xs text-gray-500 -mt-2">
            💡 O prompt padrão já está otimizado para atuação jurídica. Personalize apenas se necessário.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              fields.api_key && fields.ativo ? 'bg-emerald-500' : 'bg-gray-300'
            }`} />
            <span className="text-xs text-gray-500">
              {fields.api_key && fields.ativo 
                ? `Conectado ao ${providerName} (Ativo)` 
                : fields.api_key 
                  ? `${providerName} configurado (Inativo)`
                  : 'Aguardando configuração'
              }
            </span>
          </div>
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-sm text-emerald-600"
            >
              <CheckCircle size={14} /> Salvo com sucesso
            </motion.div>
          )}
          <Button icon={<Save size={15} />} onClick={handleSave} loading={isSaving}>
            Salvar Configuração
          </Button>
        </div>
      </div>
    </DataCard>
  )
}
