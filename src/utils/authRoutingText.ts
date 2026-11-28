type AuthRoutingField = 'message' | 'detail'

export function readAuthRoutingText(data: unknown, field: AuthRoutingField): string {
  if (!data || typeof data !== 'object') return ''
  const value = (data as Record<string, unknown>)[field]
  return typeof value === 'string' ? value : ''
}
