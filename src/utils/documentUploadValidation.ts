const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx'])

export type DocumentUploadIssue = 'unsupported-type' | 'empty-file' | 'too-large' | 'invalid-limit' | null

export function validateDocumentUpload(
  fileName: string,
  sizeBytes: number,
  maxBytes: number,
): DocumentUploadIssue {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXTENSIONS.has(extension)) return 'unsupported-type'
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) return 'invalid-limit'
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0) return 'empty-file'
  if (sizeBytes > maxBytes) return 'too-large'
  return null
}

export function documentUploadFailureMessage(status?: number): string {
  if (status === 503) return 'A verificacao de seguranca esta indisponivel. Tente novamente mais tarde.'
  if (status === 413) return 'O arquivo excede o limite permitido pelo servidor.'
  if (status === 415) return 'O conteudo do arquivo nao corresponde a um formato permitido.'
  return 'Nao foi possivel enviar o documento. Tente novamente.'
}

export function canReplayUploadAfterListFailure(
  status: number | undefined,
  hasMatchingIdempotencyKey: boolean,
  isNetworkFailure = false,
): boolean {
  if (!hasMatchingIdempotencyKey) return false
  return isNetworkFailure || status === 429 || (status !== undefined && status >= 500 && status < 600)
}

export function documentUploadRecoveryId(responseData: unknown): string | null {
  if (!responseData || typeof responseData !== 'object') return null
  const detail = (responseData as { detail?: unknown }).detail
  if (!detail || typeof detail !== 'object') return null

  const recovery = detail as { code?: unknown; recoveryId?: unknown }
  if (recovery.code !== 'upload_cleanup_pending' || typeof recovery.recoveryId !== 'string') return null
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recovery.recoveryId)
    ? recovery.recoveryId
    : null
}
