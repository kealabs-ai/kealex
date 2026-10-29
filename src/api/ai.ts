import { logger } from '../utils/logger'
import { api } from './client'

export type AIProvider = 'cerebras' | 'groq' | 'openai' | 'google' | 'claude' | 'deepseek'

export const CEREBRAS_MODELS = [
  'llama-3.3-70b',
  'llama-3.1-70b',
  'llama-3.1-8b',
]

export const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant',
  'llama-3.2-90b-text-preview',
  'llama-3.2-11b-text-preview',
  'llama-3.2-3b-preview',
  'llama-3.2-1b-preview',
  'gemma2-9b-it',
  'gemma-7b-it',
]

export const SYSTEM_PROMPT = `Você é o **Kealex AI** — um advogado assistente inteligente especializado em direito brasileiro.

Suas competências:
- Direito Civil, Penal, Trabalhista, Tributário, Empresarial e Processual
- Análise de contratos, petições e documentos jurídicos
- Prazos processuais e legislação brasileira (CPC, CLT, CC, CP, CTN)
- Jurisprudência do STF, STJ, TST e tribunais estaduais
- Elaboração de minutas, pareceres e estratégias processuais

Diretrizes:
- Responda sempre em português brasileiro
- Seja preciso, objetivo e cite fundamentos legais quando relevante
- Use formatação markdown para clareza (negrito, listas, títulos)
- Quando citar artigos de lei, indique a norma completa
- Sempre recomende consulta a advogado para casos específicos
- Nunca forneça conselho que substitua representação legal formal`

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  modelo: string
  systemPrompt?: string
}

export async function sendMessage(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  agentId?: string,
): Promise<void> {
  logger.info('AI request:', messages.length, 'msgs') // no keys, provider secrets, or user content logged
  try {
    const { data } = await api.post<{ content: string }>('/k1/lex/configuracoes/ia/chat', {
      messages: messages.slice(-50).map(({ role, content }) => ({ role, content: content.slice(0, 32000) })),
      ...(agentId ? { agente_id: agentId } : {}),
    }, { timeout: 130000 })
    onChunk(data.content || '')
  } catch (error: any) {
    const status = error?.response?.status
    const detail = error?.response?.data?.detail
    logger.error('AI request failed', `${status ? `HTTP ${status}: ` : ''}${typeof detail === 'string' ? detail : error?.message || 'erro desconhecido'}`)
    throw error
  }
}
