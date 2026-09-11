interface Props { content: string }

function parseInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="md-bold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="md-link">$1</a>')
}

export function MarkdownRenderer({ content }: Props) {
  const lines = content.split('\n')
  const blocks: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Bloco de código ```
    if (line.trimStart().startsWith('```')) {
      const lang = line.replace(/^```/, '').trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push(
        `<div class="md-code-block"><div class="md-code-lang">${lang || 'código'}</div><pre class="md-pre"><code>${codeLines.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre></div>`
      )
      i++
      continue
    }

    // Separador ---
    if (/^---+$/.test(line.trim())) {
      blocks.push('<hr class="md-hr" />')
      i++
      continue
    }

    // Headings
    const h3 = line.match(/^### (.+)/)
    if (h3) { blocks.push(`<h3 class="md-h3">${parseInline(h3[1])}</h3>`); i++; continue }
    const h2 = line.match(/^## (.+)/)
    if (h2) { blocks.push(`<h2 class="md-h2">${parseInline(h2[1])}</h2>`); i++; continue }
    const h1 = line.match(/^# (.+)/)
    if (h1) { blocks.push(`<h1 class="md-h1">${parseInline(h1[1])}</h1>`); i++; continue }

    // Lista não-ordenada
    if (/^[-*] /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(`<li class="md-li"><span class="md-bullet">•</span><span>${parseInline(lines[i].replace(/^[-*] /, ''))}</span></li>`)
        i++
      }
      blocks.push(`<ul class="md-ul">${items.join('')}</ul>`)
      continue
    }

    // Lista ordenada
    if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const m = lines[i].match(/^(\d+)\. (.+)/)!
        items.push(`<li class="md-li"><span class="md-bullet md-num">${m[1]}.</span><span>${parseInline(m[2])}</span></li>`)
        i++
      }
      blocks.push(`<ol class="md-ul">${items.join('')}</ol>`)
      continue
    }

    // Linha em branco
    if (line.trim() === '') { i++; continue }

    // Parágrafo — agrupa linhas consecutivas
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !/^[#\-*`]/.test(lines[i]) && !/^\d+\. /.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
      paraLines.push(parseInline(lines[i]))
      i++
    }
    if (paraLines.length) blocks.push(`<p class="md-p">${paraLines.join('<br/>')}</p>`)
  }

  return (
    <div
      className="md-root"
      dangerouslySetInnerHTML={{ __html: blocks.join('') }}
    />
  )
}
