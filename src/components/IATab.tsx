import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, CheckCircle, ExternalLink, Eye, EyeOff, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button, Input, Textarea } from '../components/UI'
import { DataCard } from '../components/Cards'
import { type AIProvider } from '../api/ai'
import { useConfigIa, useModelosDisponiveis } from '../hooks/useConfiguracoes'
import axios from 'axios'

export function IATab() {
  const { data: cfg, save, isSaving, isLoading } = useConfigIa()
  const { data: modelosDisponiveis, isLoading: isLoadingModelos } = useModelosDisponiveis()
  const [saved, setSaved] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [loadingGroqModels, setLoadingGroqModels] = useState(false)
  const [groqModels, setGroqModels] = useState<string[]>([])
  const [fields, setFields] = useState({
    provider:      'cerebras' as AIProvider,
    api_key:       '',
    modelo:        'llama-3.3-70b',
    max_tokens:    '8192',
    system_prompt: '',
    ativo:         true,
  })

  // Carregar configuração do backend
  useEffect(() => {
    if (cfg) {
      console.log('[Admin IA] Configuração carregada:', {
        provider: cfg.provider,
        cerebras_key: cfg.cerebras_api_key ? 'Configurada' : 'Vazia',
        groq_key: cfg.groq_api_key ? 'Configurada' : 'Vazia',
        api_key: cfg.api_key ? 'Configurada' : 'Vazia',
        ativo: cfg.ativo
      })
      
      // Se não tiver API key configurada, usar a do .env
      const defaultGroqKey = import.meta.env.GROQ_API_KEY || ''
      const apiKey = cfg.api_key || (cfg.provider === 'groq' ? defaultGroqKey : '')
      
      setFields({
        provider:      (cfg.provider || 'cerebras') as AIProvider,
        api_key:       apiKey,
        modelo:        cfg.modelo || 'llama-3.3-70b',
        max_tokens:    String(cfg.max_tokens || 8192),
        system_prompt: cfg.system_prompt || '',
        ativo:         cfg.ativo ?? true,
      })
      
      // Se for Groq e tiver chave, carregar modelos
      if (cfg.provider === 'groq') {
        const keyToUse = cfg.api_key || defaultGroqKey
        if (keyToUse) loadGroqModels(keyToUse)
      }
    }
  }, [cfg])

  // Função para carregar modelos do Groq
  const loadGroqModels = async (apiKey: string) => {
    setLoadingGroqModels(true)
    try {
      console.log('[Admin IA] Carregando modelos do Groq...')
      const response = await axios.get('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      // Extrair apenas modelos ativos e com suporte a chat
      const models = response.data.data
        .filter((m: any) => m.active && m.id.includes('llama'))
        .map((m: any) => m.id)
        .sort()
      
      console.log('[Admin IA] Modelos Groq carregados:', models)
      setGroqModels(models)
    } catch (error: any) {
      console.error('[Admin IA] Erro ao carregar modelos Groq:', error)
      // Usar modelos padrão em caso de erro
      setGroqModels([
        'llama-3.3-70b-versatile',
        'llama-3.1-70b-versatile',
        'llama-3.1-8b-instant'
      ])
    } finally {
      setLoadingGroqModels(false)
    }
  }

  // Handler para trocar provider
  const handleProviderChange = (newProvider: AIProvider) => {
    console.log('[Admin IA] Trocando provider para:', newProvider)
    
    // Carregar API Key do novo provider (prioriza backend, fallback para .env)
    const defaultGroqKey = import.meta.env.VITE_GROQ_API_KEY || ''
    const apiKey = newProvider === 'groq'
      ? (cfg?.groq_api_key || defaultGroqKey)
      : (cfg?.cerebras_api_key || '')
    
    // Usar modelos dinâmicos do backend ou fallback para constantes locais
    const modelosPorProvider = modelosDisponiveis || {
      cerebras: ['llama-3.3-70b', 'llama-3.1-70b', 'llama-3.1-8b'],
      groq: groqModels.length > 0 ? groqModels : ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant']
    }
    
    const modelo = newProvider === 'groq' 
      ? (modelosPorProvider.groq[0] || 'llama-3.3-70b-versatile')
      : (modelosPorProvider.cerebras[0] || 'llama-3.3-70b')
    
    console.log('[Admin IA] API Key do novo provider:', apiKey ? 'Configurada' : 'Vazia')
    
    // Se trocar para Groq e tiver API key, carregar modelos
    if (newProvider === 'groq' && apiKey) {
      loadGroqModels(apiKey)
    }
    
    setFields(prev => ({
      ...prev,
      provider: newProvider,
      api_key: apiKey,
      modelo: modelo
    }))
  }

  const set = (k: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      console.log(`[Admin IA] Atualizando ${k}:`, value)
      setFields((prev) => ({ ...prev, [k]: value }))
    }

  const handleSave = async () => {
    const payload = {
      provider: fields.provider,
      api_key: fields.api_key,
      modelo: fields.modelo,
      max_tokens: parseInt(fields.max_tokens),
      system_prompt: fields.system_prompt || undefined,
      ativo: fields.ativo,
    }
    
    console.log('[Admin IA] Salvando configuração:', payload)
    
    try {
      const result = await save(payload)
      console.log('[Admin IA] Configuração salva com sucesso:', result)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error: any) {
      console.error('[Admin IA] Erro ao salvar:', error)
      alert(error.message || 'Erro ao salvar configuração')
    }
  }

  const provider = fields.provider
  
  // Usar modelos dinâmicos: Groq da API, Cerebras do backend
  const modelosPorProvider = {
    cerebras: modelosDisponiveis?.cerebras || ['llama-3.3-70b', 'llama-3.1-70b', 'llama-3.1-8b'],
    groq: groqModels.length > 0 ? groqModels : (modelosDisponiveis?.groq || [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant'
    ])
  }
  
  const models = provider === 'groq' ? modelosPorProvider.groq : modelosPorProvider.cerebras
  const providerName = provider === 'groq' ? 'Groq' : 'Cerebras'
  const providerUrl = provider === 'groq' ? 'https://console.groq.com' : 'https://cloud.cerebras.ai'
  const keyPrefix = provider === 'groq' ? 'gsk-' : 'csk-'
  
  // Verificar se o modelo atual é válido
  const isModeloValido = models.includes(fields.modelo)
  const modeloDescontinuado = !isModeloValido && fields.modelo

  if (isLoading || isLoadingModelos) {
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
          {/* Provider Selection */}
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

          {/* API Key */}
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
            
            {/* Toggle Ativo */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Configuração Ativa</p>
                <p className="text-xs text-gray-500">Esta API Key será usada pelo Kealex AI</p>
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

          {/* Modelo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
                Modelo
              </label>
              {provider === 'groq' && fields.api_key && (
                <button
                  type="button"
                  onClick={() => loadGroqModels(fields.api_key)}
                  disabled={loadingGroqModels}
                  className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 disabled:opacity-50"
                  title="Recarregar modelos da API Groq"
                >
                  <RefreshCw size={12} className={loadingGroqModels ? 'animate-spin' : ''} />
                  {loadingGroqModels ? 'Carregando...' : 'Atualizar modelos'}
                </button>
              )}
            </div>
            
            {/* Aviso de modelo descontinuado */}
            {modeloDescontinuado && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 mb-1">
                      Modelo descontinuado detectado
                    </p>
                    <p className="text-amber-700 text-xs">
                      O modelo "{fields.modelo}" não está mais disponível. 
                      Selecione um modelo atualizado abaixo.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <select
              value={isModeloValido ? fields.modelo : ''}
              onChange={set('modelo')}
              className={`w-full border rounded-xl px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                modeloDescontinuado ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
              }`}
            >
              {!isModeloValido && (
                <option value="" disabled>
                  Selecione um modelo atualizado
                </option>
              )}
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {provider === 'groq' 
                ? groqModels.length > 0 
                  ? `${groqModels.length} modelos disponíveis (carregados da API Groq)`
                  : 'llama-3.3-70b-versatile — recomendado para tarefas jurídicas complexas'
                : 'llama-3.3-70b — balanço ideal entre velocidade e precisão'}
            </p>
          </div>

          {/* Max tokens */}
          <Input
            label="Max Tokens"
            type="number"
            value={fields.max_tokens}
            onChange={set('max_tokens')}
          />

          {/* System prompt */}
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
