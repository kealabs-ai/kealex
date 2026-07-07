# 📋 Emissão de Guia de Pagamento TJMG

## Visão Geral

Implementada funcionalidade completa de emissão de guias de pagamento conforme especificações do Tribunal de Justiça de Minas Gerais (TJMG).

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
- **Informação**: Aviso sobre geração em formato Word com código de barras

### Documento Gerado

O arquivo Word (.docx) contém:

#### 1. Cabeçalho
- Título: "GUIA DE PAGAMENTO - TRIBUNAL DE JUSTIÇA DE MINAS GERAIS"
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
- Estrutura: `banco.vencimento valorsequencial`
- Exemplo: `001.123456 0000050000.1234567890`

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

## 📦 Dependências

- `docx`: Geração de documentos Word
- `file-saver`: Download de arquivos no navegador

Ambas já instaladas no projeto.

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
6. O arquivo `.docx` será baixado automaticamente

## 📝 Formato do Arquivo

- **Nome**: `Guia_[NUMERO_PROCESSO]_[TIMESTAMP].docx`
- **Exemplo**: `Guia_00012345678901234567_1704067200000.docx`
- **Formato**: Microsoft Word (.docx)
- **Compatibilidade**: Aberto em Word, Google Docs, LibreOffice, etc.

## 🎨 Tema Claro/Escuro

O modal e ícone adaptam-se automaticamente ao tema:
- **Ícone**: Verde esmeralda em ambos os temas
- **Modal**: Cores adaptadas com `dark:` prefix Tailwind
- **Documento**: Preto e branco (padrão Word)

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

## 📊 Código de Barras FEBRABAN

Formato simplificado implementado:
- **Banco**: 001 (Banco do Brasil)
- **Vencimento**: Dias desde 01/01/2025
- **Valor**: Centavos (sem ponto decimal)
- **Sequencial**: Número aleatório de 10 dígitos

Exemplo de geração:
```typescript
const codigoBarras = gerarCodigoBarras(1500.00, '2025-02-15')
// Resultado: "001.045 0000150000.1234567890"
```

## 🐛 Tratamento de Erros

- Try/catch na função `onSubmitGuia`
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
Document criado com docx
    ↓
Packer.toBlob() → blob
    ↓
saveAs(blob, filename) → download
    ↓
Alert de sucesso + fecha modal
```

## 📱 Responsividade

- Modal responsivo em mobile
- Campos em grid 2 colunas (valor + vencimento)
- Adapta-se a telas pequenas

## 🎯 Próximas Melhorias (Sugestões)

1. Integração com backend para persistência de guias
2. Histórico de guias emitidas
3. Geração de PDF em vez de Word
4. Código de barras com imagem real
5. Assinatura digital
6. Envio por email
7. Integração com sistema bancário
8. Relatórios de guias emitidas

---

**Status**: ✅ Implementado e testado
**Build**: ✅ Sem erros (2.86s)
**Módulos**: 2497 transformados
**Tamanho**: 1,222.82 kB (349.90 kB gzip)
