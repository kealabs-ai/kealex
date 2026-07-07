import PDFDocument from 'pdfkit'
import { saveAs } from 'file-saver'

interface GuiaData {
  numeroProcesso: string
  titulo: string
  vara: string
  tribunal: string
  clienteNome: string
  tipo: 'custas' | 'honorarios' | 'deposito' | 'multa' | 'outro'
  valor: number
  vencimento: string
  descricao: string
  codigoBarras?: string
  dataEmissao?: string
}

const gerarCodigoBarras = (valor: number, vencimento: string): string => {
  const banco = '001'
  const dataVenc = new Date(vencimento)
  const diasDesdeBase = Math.floor((dataVenc.getTime() - new Date('2025-01-01').getTime()) / (1000 * 60 * 60 * 24))
  const vencFormatado = String(diasDesdeBase).padStart(6, '0')
  const valorFormatado = String(Math.round(valor * 100)).padStart(10, '0')
  const sequencial = String(Math.floor(Math.random() * 10000000000)).padStart(10, '0')
  
  return `${banco}${vencFormatado}${valorFormatado}${sequencial}`
}

export async function gerarGuiaTJMG(data: GuiaData): Promise<void> {
  const codigoBarrasNumero = data.codigoBarras || gerarCodigoBarras(data.valor, data.vencimento)
  const dataEmissao = data.dataEmissao || new Date().toLocaleDateString('pt-BR')
  const dataVencimento = new Date(data.vencimento).toLocaleDateString('pt-BR')

  const tiposGuia: Record<string, string> = {
    custas: 'Custas Processuais',
    honorarios: 'Honorários Periciais',
    deposito: 'Depósito Judicial',
    multa: 'Multa',
    outro: 'Outro'
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => {
        const blob = new Blob(chunks as any, { type: 'application/pdf' })
        const nomeArquivo = `Guia_${data.numeroProcesso.replace(/\D/g, '')}_${new Date().getTime()}.pdf`
        saveAs(blob, nomeArquivo)
        resolve()
      })
      doc.on('error', reject)

      // Cabeçalho com símbolo da justiça
      doc.fontSize(24).text('⚖️', { align: 'center' })
      doc.moveDown(0.3)

      // Título
      doc.fontSize(14).font('Helvetica-Bold').text('GUIA DE PAGAMENTO', { align: 'center' })
      doc.fontSize(12).font('Helvetica-Bold').text('TRIBUNAL DE JUSTIÇA DE MINAS GERAIS', { align: 'center' })
      doc.moveDown(0.5)

      // Linha separadora
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
      doc.moveDown(0.3)

      // Informações do tribunal
      doc.fontSize(10).font('Helvetica')
      doc.text(`Data de Emissão: ${dataEmissao}`, { align: 'right' })
      doc.moveDown(0.5)

      // Seção 1: Identificação do Processo
      doc.fontSize(11).font('Helvetica-Bold').text('1. IDENTIFICAÇÃO DO PROCESSO')
      doc.moveDown(0.2)

      doc.fontSize(9).font('Helvetica-Bold').text('Número do Processo:')
      doc.fontSize(9).font('Helvetica').text(data.numeroProcesso)
      doc.moveDown(0.3)

      doc.fontSize(9).font('Helvetica-Bold').text('Vara:')
      doc.fontSize(9).font('Helvetica').text(data.vara)
      doc.moveDown(0.3)

      doc.fontSize(9).font('Helvetica-Bold').text('Tribunal:')
      doc.fontSize(9).font('Helvetica').text(data.tribunal)
      doc.moveDown(0.3)

      doc.fontSize(9).font('Helvetica-Bold').text('Título:')
      doc.fontSize(9).font('Helvetica').text(data.titulo)
      doc.moveDown(0.5)

      // Linha separadora
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
      doc.moveDown(0.3)

      // Seção 2: Dados do Pagamento
      doc.fontSize(11).font('Helvetica-Bold').text('2. DADOS DO PAGAMENTO')
      doc.moveDown(0.2)

      doc.fontSize(9).font('Helvetica-Bold').text('Tipo de Guia:')
      doc.fontSize(9).font('Helvetica').text(tiposGuia[data.tipo])
      doc.moveDown(0.3)

      doc.fontSize(9).font('Helvetica-Bold').text('Valor:')
      doc.fontSize(9).font('Helvetica').text(
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valor)
      )
      doc.moveDown(0.3)

      doc.fontSize(9).font('Helvetica-Bold').text('Data de Vencimento:')
      doc.fontSize(9).font('Helvetica').text(dataVencimento)
      doc.moveDown(0.3)

      doc.fontSize(9).font('Helvetica-Bold').text('Responsável:')
      doc.fontSize(9).font('Helvetica').text(data.clienteNome)
      doc.moveDown(0.5)

      // Linha separadora
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
      doc.moveDown(0.3)

      // Seção 3: Código de Barras
      doc.fontSize(11).font('Helvetica-Bold').text('3. CÓDIGO DE BARRAS PARA PAGAMENTO')
      doc.moveDown(0.3)

      // Exibir código de barras em formato legível
      doc.fontSize(12).font('Helvetica-Bold').text(codigoBarrasNumero, { align: 'center' })
      doc.moveDown(0.2)

      // Formatação visual do código
      const codigoFormatado = `${codigoBarrasNumero.slice(0, 3)}.${codigoBarrasNumero.slice(3, 9)} ${codigoBarrasNumero.slice(9, 19)}.${codigoBarrasNumero.slice(19)}`
      doc.fontSize(11).font('Helvetica-Bold').text(codigoFormatado, { align: 'center' })
      doc.moveDown(0.3)

      doc.fontSize(8).font('Helvetica').text(
        '⚠️ Utilize este código de barras para realizar o pagamento em qualquer banco ou instituição financeira.',
        { align: 'center', width: 475 }
      )
      doc.moveDown(0.5)

      // Linha separadora
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
      doc.moveDown(0.3)

      // Seção 4: Descrição do Pagamento
      doc.fontSize(11).font('Helvetica-Bold').text('4. DESCRIÇÃO DO PAGAMENTO')
      doc.moveDown(0.2)
      doc.fontSize(9).font('Helvetica').text(data.descricao, { width: 475, align: 'justify' })
      doc.moveDown(0.5)

      // Linha separadora
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
      doc.moveDown(0.3)

      // Seção 5: Instruções Importantes
      doc.fontSize(11).font('Helvetica-Bold').text('5. INSTRUÇÕES IMPORTANTES')
      doc.moveDown(0.2)

      const instrucoes = [
        '• O pagamento deve ser realizado até a data de vencimento indicada acima.',
        '• Após o pagamento, guarde o comprovante para fins de comprovação.',
        '• Em caso de dúvidas, entre em contato com o tribunal responsável.',
        '• Este documento foi gerado automaticamente pelo sistema Kealex.'
      ]

      instrucoes.forEach((instr) => {
        doc.fontSize(8).font('Helvetica').text(instr, { width: 475 })
        doc.moveDown(0.15)
      })

      doc.moveDown(0.8)

      // Linha para assinatura
      doc.moveTo(40, doc.y).lineTo(200, doc.y).stroke()
      doc.moveDown(0.1)
      doc.fontSize(8).font('Helvetica').text('Assinatura do Responsável')
      doc.moveDown(0.5)

      // Rodapé
      doc.fontSize(7).font('Helvetica').text(
        `Gerado em ${new Date().toLocaleString('pt-BR')} | Sistema Kealex`,
        { align: 'center' }
      )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
