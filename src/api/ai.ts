import OpenAI from 'openai'

export type AIProvider = 'cerebras' | 'groq'

export const CEREBRAS_MODELS = [
  'llama-3.3-70b',
  'llama3.1-8b',
  'llama3.1-70b',
]

export const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
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

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  })

  const systemPrompt = config.systemPrompt || SYSTEM_PROMPT

  const stream = await client.chat.completions.create({
    model: config.modelo,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    if (delta) onChunk(delta)
  }
}
