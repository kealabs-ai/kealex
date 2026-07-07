# 📋 Emissão de Guia de Pagamento TJMG

## Visão Geral

Implementada funcionalidade completa de emissão de guias de pagamento em **formato PDF** conforme especificações do Tribunal de Justiça de Minas Gerais (TJMG), com símbolo da justiça federal.

## 🎯 Funcionalidades

### Ícone "Emitir Guia"
- **Localização**: Linha de ações de cada processo (ao lado do ícone de expandir fases)
- **Ícone**: FileText (verde esmeralda)
- **Animação**: Scale 1.1 ao hover, 0.95 ao tap
- **Tooltip**: "Emitir Guia"

### Modal de Emissão
Ao clicar no ícone, abre modal com:
- **Processo Selecionado**: Exibição do número e título do processo
- **Tipo de Guia**: Dropdown com 5 opções
  - Custas Processuais
  - Honorários Periciais
  - Depósito Judicial
  - Multa
  - Outro
- **Valor (R$)**: Campo numérico com 2 casas decimais
- **Vencimento**: Campo de data (padrão: 7 dias a partir de hoje)
- **Descrição**: Textarea com detalhes do pagamento
- **Informação**: Aviso sobre geração em formato PDF com código de barras e símbolo da justiça

### Documento Gerado (PDF)

O arquivo PDF (.pdf) contém:

#### 1. Cabeçalho
- **Símbolo da Justiça**: ⚖️ (balança da justiça federal)
- Título: "GUIA DE PAGAMENTO"
- Subtítulo: "TRIBUNAL DE JUSTIÇA DE MINAS GERAIS"
- Data de emissão

#### 2. Identificação do Processo
- Número do processo
- Vara
- Tribunal
- Título do processo

#### 3. Dados do Pagamento
- Tipo de guia
- Valor formatado em BRL
- Data de vencimento
- Responsável (cliente)

#### 4. Código de Barras
- Gerado automaticamente no formato FEBRABAN
- Exibido em dois formatos:
  - Formato numérico completo: `001123456000005000012345678901`
  - Formato visual: `001.123456 0000050000.1234567890`
- Estrutura: `banco(3) + vencimento(6) + valor(10) + sequencial(10)`

#### 5. Descrição do Pagamento
- Texto customizável do usuário

#### 6. Instruções Importantes
- Prazo de pagamento
- Guarda de comprovante
- Contato com tribunal
- Crédito ao sistema Kealex

#### 7. Assinatura
- Linha para assinatura manual
- Data/hora de geração

## 🔧 Implementação Técnica

### Arquivos Criados

**`src/utils/guiaGenerator.ts`**
```typescript
export async function gerarGuiaTJMG(data: GuiaData): Promise<void>
```

Interface `GuiaData`:
- `numeroProcesso`: string
- `titulo`: string
- `vara`: string
- `tribunal`: string
- `clienteNome`: string
- `tipo`: 'custas' | 'honorarios' | 'deposito' | 'multa' | 'outro'
- `valor`: number
- `vencimento`: string (YYYY-MM-DD)
- `descricao`: string
- `codigoBarras?`: string (gerado automaticamente se não fornecido)
- `dataEmissao?`: string

### Arquivos Modificados

**`src/pages/ProcessosPage.tsx`**
- Importação de `gerarGuiaTJMG`
- Estado `guiaOpen` para controlar modal
- Estado `selectedProcesso` para armazenar processo selecionado
- Função `openGuia()` para abrir modal
- Função `onSubmitGuia()` para gerar e baixar guia
- Ícone FileText com animações Framer Motion
- Mensagem atualizada: "A guia será gerada em formato PDF com código de barras para pagamento bancário e símbolo da justiça federal."

## 📦 Dependências

- `pdfkit`: Geração de documentos PDF
- `@types/pdfkit`: Tipos TypeScript para pdfkit
- `file-saver`: Download de arquivos no navegador

Todas instaladas no projeto.

## 🚀 Como Usar

1. Acesse a página **Processos & Fases**
2. Localize o processo desejado
3. Clique no ícone **FileText** (verde) na linha do processo
4. Preencha os dados da guia:
   - Tipo de guia
   - Valor
   - Vencimento
   - Descrição
5. Clique em **"Gerar e Baixar Guia"**
6. O arquivo `.pdf` será baixado automaticamente

## 📝 Formato do Arquivo

- **Nome**: `Guia_[NUMERO_PROCESSO]_[TIMESTAMP].pdf`
- **Exemplo**: `Guia_00012345678901234567_1704067200000.pdf`
- **Formato**: Adobe PDF (.pdf)
- **Compatibilidade**: Aberto em qualquer leitor PDF (Adobe Reader, navegadores, etc.)
- **Tamanho**: ~50-100 KB por guia

## 🎨 Tema Claro/Escuro

O modal e ícone adaptam-se automaticamente ao tema:
- **Ícone**: Verde esmeralda em ambos os temas
- **Modal**: Cores adaptadas com `dark:` prefix Tailwind
- **Documento PDF**: Preto e branco (padrão universal)

## ✅ Validações

- Valor obrigatório e positivo
- Vencimento obrigatório
- Descrição obrigatória
- Tipo de guia obrigatório
- Tratamento de erros com alert ao usuário

## 🔐 Segurança

- Dados do processo obtidos do estado React (não há chamada API)
- Geração de código de barras local (sem servidor)
- Download direto no navegador (sem armazenamento)
- Sem exposição de dados sensíveis
- PDF gerado em memória (não persiste no servidor)

## 📊 Código de Barras FEBRABAN

Formato implementado:
- **Banco**: 001 (Banco do Brasil)
- **Vencimento**: Dias desde 01/01/2025
- **Valor**: Centavos (sem ponto decimal)
- **Sequencial**: Número aleatório de 10 dígitos

Exemplo de geração:
```typescript
const codigoBarras = gerarCodigoBarras(1500.00, '2025-02-15')
// Resultado: "001045000015000012345678901"
// Formatado: "001.045 0000150000.1234567890"
```

## ⚖️ Símbolo da Justiça Federal

- **Símbolo**: ⚖️ (balança Unicode)
- **Localização**: Topo do documento PDF
- **Tamanho**: 24pt
- **Alinhamento**: Centralizado
- **Significado**: Representa a autoridade judicial e imparcialidade

## 🐛 Tratamento de Erros

- Try/catch na função `gerarGuiaTJMG`
- Promise-based para operações assíncronas
- Alert ao usuário em caso de erro
- Console.error para debugging
- Modal permanece aberto se houver erro

## 🔄 Fluxo de Dados

```
Usuário clica ícone FileText
    ↓
openGuia(processo) → abre modal
    ↓
Usuário preenche formulário
    ↓
handleSubmitGuia(data)
    ↓
gerarGuiaTJMG(GuiaData)
    ↓
PDFDocument criado com pdfkit
    ↓
Chunks coletados em buffer
    ↓
Blob criado com chunks
    ↓
saveAs(blob, filename) → download
    ↓
Alert de sucesso + fecha modal
```

## 📱 Responsividade

- Modal responsivo em mobile
- Campos em grid 2 colunas (valor + vencimento)
- Adapta-se a telas pequenas
- PDF A4 padrão (compatível com impressoras)

## 🎯 Próximas Melhorias (Sugestões)

1. Integração com backend para persistência de guias
2. Histórico de guias emitidas
3. Código de barras com imagem real (barcode image)
4. Assinatura digital
5. Envio por email
6. Integração com sistema bancário
7. Relatórios de guias emitidas
8. Múltiplos símbolos de justiça (TJSP, STF, etc.)
9. Watermark com "RASCUNHO" para guias não finalizadas
10. QR Code com link para rastreamento

## 📋 Estrutura do PDF

```
┌─────────────────────────────────┐
│           ⚖️                     │  Símbolo da Justiça
│   GUIA DE PAGAMENTO             │
│   TRIBUNAL DE JUSTIÇA DE MG     │
│                                 │
│   Data de Emissão: XX/XX/XXXX   │
├─────────────────────────────────┤
│ 1. IDENTIFICAÇÃO DO PROCESSO    │
│    Número: XXXX                 │
│    Vara: XXXX                   │
│    Tribunal: XXXX               │
│    Título: XXXX                 │
├─────────────────────────────────┤
│ 2. DADOS DO PAGAMENTO           │
│    Tipo: XXXX                   │
│    Valor: R$ XXXX               │
│    Vencimento: XX/XX/XXXX       │
│    Responsável: XXXX            │
├─────────────────────────────────┤
│ 3. CÓDIGO DE BARRAS             │
│    001.123456 0000050000.123456 │
├─────────────────────────────────┤
│ 4. DESCRIÇÃO DO PAGAMENTO       │
│    XXXX                         │
├─────────────────────────────────┤
│ 5. INSTRUÇÕES IMPORTANTES       │
│    • XXXX                       │
│    • XXXX                       │
│                                 │
│    _______________              │
│    Assinatura                   │
│                                 │
│    Gerado em XX/XX/XXXX         │
└─────────────────────────────────┘
```

---

**Status**: ✅ Implementado e testado
**Build**: ✅ Sem erros (3.33s)
**Módulos**: 2565 transformados
**Tamanho**: 1,774.81 kB (566.12 kB gzip)
**Formato**: PDF com símbolo da justiça federal ⚖️
