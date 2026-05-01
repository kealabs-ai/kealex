import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
  dangerouslyAllowBrowser: true,
})

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

export async function sendMessage(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<void> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    if (delta) onChunk(delta)
  }
}
