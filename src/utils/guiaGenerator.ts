import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle, AlignmentType } from 'docx'
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
  
  return `${banco}.${vencFormatado} ${valorFormatado}.${sequencial}`
}

export async function gerarGuiaTJMG(data: GuiaData): Promise<void> {
  const codigoBarras = data.codigoBarras || gerarCodigoBarras(data.valor, data.vencimento)
  const dataEmissao = data.dataEmissao || new Date().toLocaleDateString('pt-BR')
  const dataVencimento = new Date(data.vencimento).toLocaleDateString('pt-BR')

  const tiposGuia: Record<string, string> = {
    custas: 'Custas Processuais',
    honorarios: 'Honorários Periciais',
    deposito: 'Depósito Judicial',
    multa: 'Multa',
    outro: 'Outro'
  }

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: 'GUIA DE PAGAMENTO - TRIBUNAL DE JUSTIÇA DE MINAS GERAIS',
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              height: { value: 400, rule: 'auto' },
              children: [
                new TableCell({
                  children: [new Paragraph('TJMG - Tribunal de Justiça de Minas Gerais')],
                  borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                }),
                new TableCell({
                  children: [new Paragraph({ text: `Data de Emissão: ${dataEmissao}`, alignment: AlignmentType.RIGHT })],
                  borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                })
              ]
            })
          ]
        }),

        new Paragraph({ text: '', spacing: { after: 400 } }),

        new Paragraph({
          text: '1. IDENTIFICAÇÃO DO PROCESSO',
          spacing: { before: 200, after: 200 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph('Número do Processo:'),
                    new Paragraph({ text: data.numeroProcesso, spacing: { after: 200 } })
                  ],
                  borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                }),
                new TableCell({
                  children: [
                    new Paragraph('Vara:'),
                    new Paragraph({ text: data.vara, spacing: { after: 200 } })
                  ],
                  borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph('Tribunal:'),
                    new Paragraph({ text: data.tribunal, spacing: { after: 200 } })
                  ],
                  borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                }),
                new TableCell({
                  children: [
                    new Paragraph('Título:'),
                    new Paragraph({ text: data.titulo, spacing: { after: 200 } })
                  ],
                  borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                })
              ]
            })
          ]
        }),

        new Paragraph({ text: '', spacing: { after: 400 } }),

        new Paragraph({
          text: '2. DADOS DO PAGAMENTO',
          spacing: { before: 200, after: 200 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph('Tipo de Guia:'),
                    new Paragraph({ text: tiposGuia[data.tipo], spacing: { after: 200 } })
                  ],
                  borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                }),
                new TableCell({
                  children: [
                    new Paragraph('Valor:'),
                    new Paragraph({ 
                      text: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valor),
                      spacing: { after: 200 }
                    })
                  ],
                  borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph('Data de Vencimento:'),
                    new Paragraph({ text: dataVencimento, spacing: { after: 200 } })
                  ],
                  borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                }),
                new TableCell({
                  children: [
                    new Paragraph('Responsável:'),
                    new Paragraph({ text: data.clienteNome, spacing: { after: 200 } })
                  ],
                  borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.SINGLE }, right: { style: BorderStyle.SINGLE } }
                })
              ]
            })
          ]
        }),

        new Paragraph({ text: '', spacing: { after: 400 } }),

        new Paragraph({
          text: '3. CÓDIGO DE BARRAS PARA PAGAMENTO',
          spacing: { before: 200, after: 200 }
        }),

        new Paragraph({
          text: codigoBarras,
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 }
        }),

        new Paragraph({
          text: '⚠️ Utilize este código de barras para realizar o pagamento em qualquer banco ou instituição financeira.',
          spacing: { after: 400 }
        }),

        new Paragraph({
          text: '4. DESCRIÇÃO DO PAGAMENTO',
          spacing: { before: 200, after: 200 }
        }),

        new Paragraph({
          text: data.descricao,
          spacing: { after: 400 }
        }),

        new Paragraph({
          text: '5. INSTRUÇÕES IMPORTANTES',
          spacing: { before: 200, after: 200 }
        }),

        new Paragraph({
          text: '• O pagamento deve ser realizado até a data de vencimento indicada acima.',
          spacing: { after: 100 }
        }),

        new Paragraph({
          text: '• Após o pagamento, guarde o comprovante para fins de comprovação.',
          spacing: { after: 100 }
        }),

        new Paragraph({
          text: '• Em caso de dúvidas, entre em contato com o tribunal responsável.',
          spacing: { after: 100 }
        }),

        new Paragraph({
          text: '• Este documento foi gerado automaticamente pelo sistema Kealex.',
          spacing: { after: 800 }
        }),

        new Paragraph({
          text: '_________________________________',
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),

        new Paragraph({
          text: 'Assinatura do Responsável',
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        new Paragraph({
          text: `Gerado em ${new Date().toLocaleString('pt-BR')}`,
          alignment: AlignmentType.CENTER
        })
      ]
    }]
  })

  const blob = await Packer.toBlob(doc)
  const nomeArquivo = `Guia_${data.numeroProcesso.replace(/\D/g, '')}_${new Date().getTime()}.docx`
  saveAs(blob, nomeArquivo)
}
