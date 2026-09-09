interface Props { content: string }

export function MarkdownRenderer({ content }: Props) {
  const html = content
    .replace(/^### (.+)$/gm, '<h3 class="md-heading">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="md-heading md-heading-lg">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="md-heading md-heading-xl">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="md-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="md-code">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="md-li"><span class="md-bullet">•</span><span>$1</span></li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="md-li"><span class="md-bullet md-num">$1.</span><span>$2</span></li>')
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul class="space-y-1 my-2">${m}</ul>`)
    .replace(/\n\n/g, '</p><p class="md-p">')
    .replace(/\n/g, '<br/>')

  return (
    <div
      className="md-root text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class="md-p">${html}</p>` }}
    />
  )
}
