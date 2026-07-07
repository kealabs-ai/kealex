import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, BorderStyle, TextRun } from 'docx'
import { saveAs } from 'file-saver'

interface DocumentoConfig {
  titulo: string
  conteudo: string
  autor?: string
  data?: Date
}

export async function gerarDocumentoWord(config: DocumentoConfig) {
  const { titulo, conteudo, autor = 'Kealex AI', data = new Date() } = config

  // Processar conteúdo markdown para parágrafos
  const paragrafos = conteudo.split('\n').map((linha) => {
    // Detectar títulos (# ## ###)
    if (linha.startsWith('### ')) {
      return new Paragraph({
        text: linha.replace('### ', ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: linha.replace('### ', ''), bold: true })],
      })
    }
    if (linha.startsWith('## ')) {
      return new Paragraph({
        text: linha.replace('## ', ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [new TextRun({ text: linha.replace('## ', ''), bold: true })],
      })
    }
    if (linha.startsWith('# ')) {
      return new Paragraph({
        text: linha.replace('# ', ''),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [new TextRun({ text: linha.replace('# ', ''), bold: true, size: 28 })],
      })
    }

    // Detectar listas
    if (linha.startsWith('- ') || linha.startsWith('* ')) {
      return new Paragraph({
        text: linha.replace(/^[-*]\s/, ''),
        bullet: { level: 0 },
        spacing: { after: 100 },
      })
    }

    // Linhas vazias
    if (linha.trim() === '') {
      return new Paragraph({ text: '' })
    }

    // Texto normal
    return new Paragraph({
      text: linha,
      spacing: { after: 100 },
      alignment: AlignmentType.JUSTIFIED,
    })
  })

  // Criar documento
  const doc = new Document({
    sections: [
      {
        children: [
          // Cabeçalho
          new Paragraph({
            text: titulo,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: titulo, bold: true, size: 28 })],
          }),

          // Metadados
          new Paragraph({
            text: `Gerado por: ${autor}`,
            spacing: { after: 50 },
            children: [new TextRun({ text: `Gerado por: ${autor}`, size: 20, color: '666666' })],
          }),
          new Paragraph({
            text: `Data: ${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR')}`,
            spacing: { after: 300 },
            children: [new TextRun({ text: `Data: ${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR')}`, size: 20, color: '666666' })],
          }),

          // Linha divisória
          new Paragraph({
            border: {
              bottom: {
                color: 'CCCCCC',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { after: 300 },
          }),

          // Conteúdo
          ...paragrafos,

          // Rodapé
          new Paragraph({
            text: '',
            spacing: { before: 400 },
          }),
          new Paragraph({
            border: {
              top: {
                color: 'CCCCCC',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            text: 'Documento gerado automaticamente pelo Kealex AI Hub',
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Documento gerado automaticamente pelo Kealex AI Hub', size: 18, color: '999999', italics: true })],
          }),
          new Paragraph({
            text: 'Este documento é fornecido apenas para referência. Consulte sempre um advogado para casos específicos.',
            alignment: AlignmentType.CENTER,
            spacing: { before: 100 },
            children: [new TextRun({ text: 'Este documento é fornecido apenas para referência. Consulte sempre um advogado para casos específicos.', size: 18, color: 'CC0000' })],
          }),
        ],
      },
    ],
  })

  // Gerar e baixar
  const blob = await Packer.toBlob(doc)
  const nomeArquivo = `${titulo.replace(/\s+/g, '_')}_${new Date().getTime()}.docx`
  saveAs(blob, nomeArquivo)
}

export async function gerarDocumentoWordDoChat(
  titulo: string,
  mensagens: Array<{ role: string; content: string }>,
  autor?: string
) {
  // Extrair apenas respostas da IA
  const conteudoIA = mensagens
    .filter((m) => m.role === 'assistant')
    .map((m) => m.content)
    .join('\n\n---\n\n')

  await gerarDocumentoWord({
    titulo,
    conteudo: conteudoIA,
    autor,
    data: new Date(),
  })
}
