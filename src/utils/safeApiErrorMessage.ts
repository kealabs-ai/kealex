type ApiErrorShape = {
  response?: { status?: unknown }
}

export function safeApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback
  const status = (error as ApiErrorShape).response?.status
  return typeof status === 'number' && Number.isInteger(status)
    ? `${fallback} (HTTP ${status})`
    : fallback
}
