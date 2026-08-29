# Kealex Frontend

Plataforma jurídica SaaS — Interface React com Tailwind CSS, React Query e IA integrada.

## 🚀 Stack

- **React 18** + **TypeScript**
- **Vite** — Build tool
- **Tailwind CSS v4** — Styling
- **React Query** — Data fetching & cache
- **React Router** — Navegação
- **Framer Motion** — Animações
- **OpenAI API** — Chat com IA jurídica
- **Axios** — HTTP client
- **React Hook Form** + **Zod** — Formulários

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

1. Copie o `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure sua chave da OpenAI no `.env`:
```env
VITE_OPENAI_API_KEY=sk-proj-sua-chave-aqui
```

3. Certifique-se que o backend FastAPI está rodando na porta **8000**

## 🏃 Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 🏗️ Build de Produção

```bash
npm run build
npm run preview
```

## 🔐 Credenciais de Teste

| Role | Email | Senha |
|------|-------|-------|
| Admin | admin@keahub.com | admin123 |
| Advogado | adv@keahub.com | adv123 |
| Cliente | cliente@keahub.com | cli123 |

## 📁 Estrutura

```
src/
├── api/          # Clientes HTTP (axios)
├── components/   # Componentes reutilizáveis
├── context/      # Context API (Auth)
├── hooks/        # React Query hooks
├── pages/        # Páginas da aplicação
└── types/        # TypeScript types
```

## 🎨 Páginas

- **Login** — Autenticação JWT
- **Processos** — CRUD de processos jurídicos
- **Documentos** — Upload e gestão de documentos
- **Prazos** — Controle de prazos processuais com alertas
- **Financeiro** — Honorários e dashboard de faturamento
- **Usuários** — Gestão de usuários (Admin only)
- **Kealex AI** — Chat com assistente jurídico inteligente
- **Admin** — Configurações do sistema (CDN, DB, IA, Segurança)

## 🤖 Kealex AI

Chat com GPT-4o mini especializado em direito brasileiro:
- Análise de casos e legislação
- Prazos processuais (CPC, CLT)
- Jurisprudência STF/STJ
- Elaboração de minutas
- 8 prompts sugeridos por área jurídica

## 🔒 Autenticação

- JWT armazenado em `localStorage`
- Interceptor axios injeta token automaticamente
- Validação de expiração a cada 60s
- Redirect automático em 401
- Controle de acesso por role (admin/advogado/cliente)

## 🌐 Proxy API

O Vite proxy redireciona `/api/*` para `http://localhost:8000`:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

## 📊 React Query

Cache configurado com:
- `staleTime`: 30s
- `retry`: 1
- Invalidação automática após mutations

## 🎯 Features

- ✅ Design system premium com gradientes e animações
- ✅ Sidebar dark com controle de role
- ✅ Modais animados com Framer Motion
- ✅ Skeleton loading states
- ✅ Empty states com ilustrações
- ✅ Badges coloridos por status
- ✅ Busca em tempo real
- ✅ Filtros e ordenação
- ✅ Responsivo mobile-first
- ✅ Markdown rendering no chat IA
- ✅ Streaming de respostas da IA
- ✅ Sessão persistente com validação JWT

## 🛠️ Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run preview  # Preview do build
npm run lint     # ESLint
```

## 📝 Licença

Propriedade de Kealabs AI © 2025
