import OpenAI from 'openai'
import { logger } from '../utils/logger'

export type AIProvider = 'cerebras' | 'groq'

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
  config: AIConfig,
  onChunk: (chunk: string) => void
): Promise<void> {
  const baseURL = config.provider === 'groq'
    ? 'https://api.groq.com/openai/v1'
    : 'https://api.cerebras.ai/v1'

  logger.info('AI request:', config.provider, config.modelo, messages.length, 'msgs') // provider/model only — no user content logged

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  })

  const systemPrompt = config.systemPrompt || SYSTEM_PROMPT

  try {
    const maxTokens = 2048
    const inputLimit = 32_000
    const trimmedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content.slice(0, inputLimit),
    }))

    const stream = await client.chat.completions.create({
      model: config.modelo,
      stream: true,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...trimmedMessages,
      ],
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? ''
      if (delta) onChunk(delta)
    }
  } catch (error: any) {
    logger.error('AI request failed', error)
    throw error
  }
}
