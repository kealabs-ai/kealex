# Atualizações Recentes — Kealex

## 1. Admin — Config IA: Carregamento de Modelos Groq via API

**Arquivo:** `src/components/IATab.tsx`

### O que foi feito
- O combo "Modelo" agora carrega os modelos disponíveis diretamente da API Groq em runtime
- Endpoint usado: `GET https://api.groq.com/openai/v1/models` com header `Authorization: Bearer {api_key}`
- A função `loadGroqModels(apiKey)` faz a requisição via axios e popula o select

### Comportamento
- **Ao carregar a página**: se o provider salvo for `groq`, busca modelos usando `groq_api_key` (ou `api_key` como fallback)
- **Ao trocar para Groq**: se já houver chave salva, carrega automaticamente
- **Botão "Atualizar modelos"**: usa `fields.api_key` (valor atual na tela) para buscar modelos manualmente
- Filtro aplicado: exclui modelos de áudio/visão (`whisper`, `tts`, `vision`, `guard`), aceita todos os demais
- Fallback estático caso a API falhe: `llama-3.3-70b-versatile`, `llama-3.1-70b-versatile`, `llama-3.1-8b-instant`

### Correção de filtro
- Removido filtro por `m.active` (campo inexistente na resposta da Groq)
- Removido filtro por prefixo `llama-3.` que excluía modelos válidos
- Log bruto adicionado: `console.log('[Admin IA] Modelos Groq (bruto)', ...)`

---

## 2. Correção: SkeletonRow em contexto de lista (ProcessosPage)

**Arquivos:** `src/components/Cards.tsx`, `src/pages/ProcessosPage.tsx`

### Problema
`<tr>` sendo renderizado dentro de `<div>`, causando erro de hydration no React:
> In HTML, `<tr>` cannot be a child of `<div>`

### Solução
Adicionada variante `variant` ao `SkeletonRow`:
- `variant="table"` (padrão): renderiza `<tr>/<td>` — para uso em tabelas
- `variant="list"`: renderiza `<div>` com shimmer de título, subtítulo e botões — para uso em listas

`ProcessosPage` agora usa `<SkeletonRow variant="list" />`.

---

## 3. Chat IA — Tema Light/Dark

**Arquivos:** `src/pages/IAPage.tsx`, `src/components/MarkdownRenderer.tsx`, `src/index.css`

### Problema raiz
Classes Tailwind com variante `dark:` geradas dinamicamente via string (`.replace()`) não são incluídas no bundle CSS pelo Tailwind (purge em build time).

### Solução: classes CSS semânticas

#### Bolhas do chat (`chat-bubble-user`, `chat-bubble-assistant`)
| Elemento | Light | Dark |
|---|---|---|
| Bolha usuário | `#00C2A8` (teal Kealex) + sombra teal | `#6320EE` (roxo) + sombra violet |
| Bolha assistente | `#ffffff`, borda `#d1dce8`, texto `#0f2d4a` | `#131926`, borda indigo sutil, texto `#e2e8f0` |

#### Caixa de input (`chat-input-bar`, `chat-input-box`, `chat-send-btn`)
| Elemento | Light | Dark |
|---|---|---|
| Barra inferior | `rgba(255,255,255,0.92)`, borda `#d1dce8` | `rgba(15,23,42,0.85)`, borda indigo |
| Input box | `#ffffff`, borda `#c8d5e3` | `#1e293b`, borda indigo |
| Focus input | borda `#00C2A8`, ring teal | borda `#6366f1`, ring indigo |
| Botão enviar | gradiente teal `#00C2A8 → #009e88` | gradiente indigo `#6366f1 → #7c3aed` |

#### Painel lateral direito (`chat-doc-panel`, `chat-doc-card`, `chat-doc-btn-*`)
| Elemento | Light | Dark |
|---|---|---|
| Painel fundo | `#f4f7fa`, borda `#d1dce8` | `rgba(15,23,42,0.7)`, borda `#1e293b` |
| Card documento | `#ffffff`, borda `#d1dce8`, texto `#0f2d4a` | `rgba(30,41,59,0.9)`, borda indigo |
| Botão Copiar | `#eef2f7`, texto `#1e3a52` | `#1e293b`, texto `#cbd5e1` |
| Botão .docx | gradiente teal | gradiente indigo |

#### MarkdownRenderer (`md-*`)
Todas as classes usam CSS puro com seletor `.dark`:
| Elemento | Light | Dark |
|---|---|---|
| Texto base | herda da bolha | herda da bolha |
| Headings | `#4f46e5` | `#a78bfa` |
| Bold | `#3730a3` | `#c4b5fd` |
| Code | fundo `#eef2ff`, texto `#4338ca` | fundo `#1e1b4b`, texto `#a5b4fc` |
| Bullets/números | `#6366f1` | `#818cf8` |

---

## 4. Proxy Vite — Correção ETIMEDOUT

**Arquivo:** `vite.config.ts`

### Problema
Requisições para `/k1/lex/*` chegavam sem passar pelo proxy (configurado apenas para `/api`).
Log indicava: `GET /k1/lex/processos -> /k1/lex/processos` (sem redirecionamento).

### Solução
Adicionada rota `/k1` diretamente no proxy:

```ts
proxy: {
  '/k1': {
    target: 'https://srv1023256.hstgr.cloud',
    changeOrigin: true,
    secure: false,
  },
  '/api': {
    target: 'https://srv1023256.hstgr.cloud',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
    secure: false,
  },
}
```

Requisições `/k1/lex/*` agora são redirecionadas para `https://srv1023256.hstgr.cloud/k1/lex/*`.

### Arquivo `.env` criado
`.env` criado na raiz (estava faltando, só existia `.env.example`):
```
VITE_GROQ_API_KEY=
```

---

## 5. Estrutura de arquivos relevantes

```
src/
├── api/
│   ├── client.ts          — axios instance, baseURL /api em dev
│   └── configuracoes.ts   — getModelosDisponiveis, getIa, saveIa
├── components/
│   ├── IATab.tsx          — config IA admin, loadGroqModels
│   ├── MarkdownRenderer.tsx — classes md-* CSS puro
│   └── Cards.tsx          — SkeletonRow com variant table|list
├── pages/
│   ├── IAPage.tsx         — chat, classes chat-bubble-*, chat-input-*, chat-doc-*
│   └── ProcessosPage.tsx  — usa SkeletonRow variant="list"
├── index.css              — todos os estilos semânticos do chat
vite.config.ts             — proxy /k1 e /api
.env                       — VITE_GROQ_API_KEY
```
