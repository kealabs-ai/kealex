interface Props { content: string }

export function MarkdownRenderer({ content }: Props) {
  const html = content
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-violet-400 mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-violet-400 mt-4 mb-1.5">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-violet-400 mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-violet-300">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-700 text-violet-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="flex gap-2 text-sm"><span class="text-violet-400 mt-0.5 shrink-0">•</span><span>$1</span></li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="flex gap-2 text-sm"><span class="text-violet-400 font-semibold shrink-0">$1.</span><span>$2</span></li>')
    .replace(/(<li.*<\/li>\n?)+/g, (m) => `<ul class="space-y-1 my-2">${m}</ul>`)
    .replace(/\n\n/g, '</p><p class="text-sm leading-relaxed mt-2">')
    .replace(/\n/g, '<br/>')

  return (
    <div
      className="text-sm text-slate-200 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class="text-sm leading-relaxed">${html}</p>` }}
    />
  )
}
