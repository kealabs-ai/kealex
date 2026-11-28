import type { Config } from 'dompurify'

export const MARKDOWN_SANITIZE_OPTIONS: Config = {
  ALLOWED_TAGS: ['a', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'hr', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'ul'],
  // Links from untrusted Markdown stay in the current tab; target/rel are never accepted.
  ALLOWED_ATTR: ['class', 'href'],
  ALLOW_DATA_ATTR: false,
}
