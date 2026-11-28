type ChatError = {
  response?: { status?: unknown }
}

export function aiChatErrorMessage(error: unknown, provider: string): string {
  const status = error && typeof error === 'object'
    ? (error as ChatError).response?.status
    : undefined

  if (status === 401) return `Chave da API ${provider} inválida. Verifique as configurações.`
  if (status === 404) return 'A rota de chat não foi encontrada no servidor. Atualize o serviço de configurações de IA.'
  return 'Erro ao conectar com a IA. Verifique sua configuração.'
}
