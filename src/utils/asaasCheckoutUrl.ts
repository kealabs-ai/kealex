const ASAAS_HOST = 'asaas.com'

export function safeAsaasCheckoutUrl(value: string): string | null {
  try {
    const url = new URL(value.trim())
    const trustedHost = url.hostname.toLowerCase() === ASAAS_HOST
      || url.hostname.toLowerCase().endsWith(`.${ASAAS_HOST}`)
    if (
      url.protocol !== 'https:'
      || !trustedHost
      || url.username
      || url.password
      || url.port
    ) return null
    return url.href
  } catch {
    return null
  }
}
