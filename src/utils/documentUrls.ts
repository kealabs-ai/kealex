/** Legal evidence must be retrieved through the authenticated private file API. */
export function privateDocumentFileMatch(value: string): RegExpExecArray | null {
  return /^\/v1\/lex\/arquivos\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(value)
}
