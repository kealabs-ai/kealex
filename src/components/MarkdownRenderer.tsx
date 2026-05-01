interface Props { content: string }

export function MarkdownRenderer({ content }: Props) {
  const html = content
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-gray-900 mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-gray-900 mt-4 mb-1.5">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="flex gap-2 text-sm"><span class="text-indigo-400 mt-0.5 shrink-0">•</span><span>$1</span></li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="flex gap-2 text-sm"><span class="text-indigo-500 font-semibold shrink-0">$1.</span><span>$2</span></li>')
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul class="space-y-1 my-2">${m}</ul>`)
    .replace(/\n\n/g, '</p><p class="text-sm text-gray-700 leading-relaxed mt-2">')
    .replace(/\n/g, '<br/>')

  return (
    <div
      className="text-sm text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class="text-sm text-gray-700 leading-relaxed">${html}</p>` }}
    />
  )
}
