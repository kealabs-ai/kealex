import type { AIProvider } from '../types'

const KNOWN_MODEL_FAMILIES: Record<AIProvider, RegExp> = {
  openai: /^(gpt-|o[134]-|chatgpt-)/i,
  claude: /^claude-/i,
  google: /^gemini-/i,
  deepseek: /^deepseek-/i,
  cerebras: /^(?!gpt-|o[134]-|chatgpt-|claude-|gemini-|deepseek-).+/i,
  groq: /^(?!gpt-|o[134]-|chatgpt-|claude-|gemini-|deepseek-).+/i,
}

export function isModelCompatibleWithProvider(provider: AIProvider, model: string): boolean {
  return KNOWN_MODEL_FAMILIES[provider]?.test(model.trim()) ?? false
}
