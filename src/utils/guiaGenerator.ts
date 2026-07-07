import { jsPDF } from 'jspdf'

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
  const vencFormatado = String(Math.max(0, diasDesdeBase)).padStart(6, '0')
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

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  } as any)

  let yPos = 15

  // Cabeçalho com símbolo da justiça
  doc.setFontSize(28)
  doc.text('⚖️', 105, yPos, { align: 'center' } as any)
  yPos += 12

  // Título
  doc.setFontSize(14)
  doc.setFont(undefined as any, 'bold')
  doc.text('GUIA DE PAGAMENTO', 105, yPos, { align: 'center' } as any)
  yPos += 7

  doc.setFontSize(12)
  doc.text('TRIBUNAL DE JUSTIÇA DE MINAS GERAIS', 105, yPos, { align: 'center' } as any)
  yPos += 10

  // Linha separadora
  doc.setDrawColor(0)
  doc.line(15, yPos, 195, yPos)
  yPos += 5

  // Data de emissão
  doc.setFontSize(10)
  doc.setFont(undefined as any, 'normal')
  doc.text(`Data de Emissão: ${dataEmissao}`, 195, yPos, { align: 'right' } as any)
  yPos += 8

  // Seção 1: Identificação do Processo
  doc.setFontSize(11)
  doc.setFont(undefined as any, 'bold')
  doc.text('1. IDENTIFICAÇÃO DO PROCESSO', 15, yPos)
  yPos += 7

  doc.setFontSize(9)
  doc.setFont(undefined as any, 'bold')
  doc.text('Número do Processo:', 15, yPos)
  doc.setFont(undefined as any, 'normal')
  doc.text(data.numeroProcesso, 60, yPos)
  yPos += 6

  doc.setFont(undefined as any, 'bold')
  doc.text('Vara:', 15, yPos)
  doc.setFont(undefined as any, 'normal')
  doc.text(data.vara, 60, yPos)
  yPos += 6

  doc.setFont(undefined as any, 'bold')
  doc.text('Tribunal:', 15, yPos)
  doc.setFont(undefined as any, 'normal')
  doc.text(data.tribunal, 60, yPos)
  yPos += 6

  doc.setFont(undefined as any, 'bold')
  doc.text('Título:', 15, yPos)
  doc.setFont(undefined as any, 'normal')
  const tituloLines = doc.splitTextToSize(data.titulo, 130)
  doc.text(tituloLines as any, 60, yPos)
  yPos += tituloLines.length * 5 + 5

  // Linha separadora
  doc.line(15, yPos, 195, yPos)
  yPos += 5

  // Seção 2: Dados do Pagamento
  doc.setFontSize(11)
  doc.setFont(undefined as any, 'bold')
  doc.text('2. DADOS DO PAGAMENTO', 15, yPos)
  yPos += 7

  doc.setFontSize(9)
  doc.setFont(undefined as any, 'bold')
  doc.text('Tipo de Guia:', 15, yPos)
  doc.setFont(undefined as any, 'normal')
  doc.text(tiposGuia[data.tipo], 60, yPos)
  yPos += 6

  doc.setFont(undefined as any, 'bold')
  doc.text('Valor:', 15, yPos)
  doc.setFont(undefined as any, 'normal')
  doc.text(
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valor),
    60,
    yPos
  )
  yPos += 6

  doc.setFont(undefined as any, 'bold')
  doc.text('Data de Vencimento:', 15, yPos)
  doc.setFont(undefined as any, 'normal')
  doc.text(dataVencimento, 60, yPos)
  yPos += 6

  doc.setFont(undefined as any, 'bold')
  doc.text('Responsável:', 15, yPos)
  doc.setFont(undefined as any, 'normal')
  doc.text(data.clienteNome, 60, yPos)
  yPos += 8

  // Linha separadora
  doc.line(15, yPos, 195, yPos)
  yPos += 5

  // Seção 3: Código de Barras
  doc.setFontSize(11)
  doc.setFont(undefined as any, 'bold')
  doc.text('3. CÓDIGO DE BARRAS PARA PAGAMENTO', 15, yPos)
  yPos += 7

  doc.setFontSize(12)
  doc.setFont(undefined as any, 'bold')
  doc.text(codigoBarrasNumero, 105, yPos, { align: 'center' } as any)
  yPos += 6

  // Formatação visual do código
  const codigoFormatado = `${codigoBarrasNumero.slice(0, 3)}.${codigoBarrasNumero.slice(3, 9)} ${codigoBarrasNumero.slice(9, 19)}.${codigoBarrasNumero.slice(19)}`
  doc.setFontSize(11)
  doc.text(codigoFormatado, 105, yPos, { align: 'center' } as any)
  yPos += 8

  doc.setFontSize(8)
  doc.setFont(undefined as any, 'normal')
  const avisoLines = doc.splitTextToSize(
    '⚠️ Utilize este código de barras para realizar o pagamento em qualquer banco ou instituição financeira.',
    170
  )
  doc.text(avisoLines as any, 105, yPos, { align: 'center' } as any)
  yPos += avisoLines.length * 4 + 5

  // Linha separadora
  doc.line(15, yPos, 195, yPos)
  yPos += 5

  // Seção 4: Descrição do Pagamento
  doc.setFontSize(11)
  doc.setFont(undefined as any, 'bold')
  doc.text('4. DESCRIÇÃO DO PAGAMENTO', 15, yPos)
  yPos += 7

  doc.setFontSize(9)
  doc.setFont(undefined as any, 'normal')
  const descricaoLines = doc.splitTextToSize(data.descricao, 170)
  doc.text(descricaoLines as any, 15, yPos)
  yPos += descricaoLines.length * 5 + 5

  // Linha separadora
  doc.line(15, yPos, 195, yPos)
  yPos += 5

  // Seção 5: Instruções Importantes
  doc.setFontSize(11)
  doc.setFont(undefined as any, 'bold')
  doc.text('5. INSTRUÇÕES IMPORTANTES', 15, yPos)
  yPos += 7

  doc.setFontSize(8)
  doc.setFont(undefined as any, 'normal')
  const instrucoes = [
    '• O pagamento deve ser realizado até a data de vencimento indicada acima.',
    '• Após o pagamento, guarde o comprovante para fins de comprovação.',
    '• Em caso de dúvidas, entre em contato com o tribunal responsável.',
    '• Este documento foi gerado automaticamente pelo sistema Kealex.'
  ]

  instrucoes.forEach((instr) => {
    doc.text(instr, 15, yPos)
    yPos += 5
  })

  yPos += 8

  // Linha para assinatura
  doc.line(15, yPos, 60, yPos)
  yPos += 3
  doc.setFontSize(8)
  doc.text('Assinatura do Responsável', 15, yPos)
  yPos += 8

  // Rodapé
  doc.setFontSize(7)
  doc.setTextColor(150)
  doc.text(
    `Gerado em ${new Date().toLocaleString('pt-BR')} | Sistema Kealex`,
    105,
    yPos,
    { align: 'center' } as any
  )

  // Salvar PDF
  const nomeArquivo = `Guia_${data.numeroProcesso.replace(/\D/g, '')}_${new Date().getTime()}.pdf`
  doc.save(nomeArquivo)
}
