import DOMPurify from 'dompurify'
import { MARKDOWN_SANITIZE_OPTIONS } from '../utils/markdownSanitizePolicy'
import { markdownToHtml } from '../utils/markdownToHtml'

interface Props { content: string }

export function MarkdownRenderer({ content }: Props) {
  return (
    <div
      className="md-root"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(markdownToHtml(content), MARKDOWN_SANITIZE_OPTIONS) }}
    />
  )
}
