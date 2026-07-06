# 🚀 Guia de Instalação & Configuração — Kealex AI Platform

## 📋 Pré-requisitos

- Node.js 18+ (https://nodejs.org)
- npm ou yarn
- Git
- Backend FastAPI rodando na porta 8000

---

## 🔧 Instalação

### 1. Clone o Repositório
```bash
git clone https://github.com/kealabs/ViewKealex.git
cd ViewKealex
```

### 2. Instale Dependências
```bash
npm install
```

### 3. Configure Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite `.env` com suas configurações:
```env
# API Backend
VITE_API_URL=http://localhost:8000

# OpenAI (para IA jurídica)
VITE_OPENAI_API_KEY=sk-proj-sua-chave-aqui

# Groq (alternativa)
VITE_GROQ_API_KEY=gsk_sua-chave-aqui

# Cerebras (alternativa)
VITE_CEREBRAS_API_KEY=sua-chave-aqui

# Ambiente
VITE_ENV=development
```

### 4. Inicie o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse: **http://localhost:5173**

---

## 🔐 Credenciais de Teste

| Role | Email | Senha |
|------|-------|-------|
| Admin | admin@keahub.com | admin123 |
| Advogado | adv@keahub.com | adv123 |
| Cliente | cliente@keahub.com | cli123 |

---

## ⚙️ Configuração Inicial

### 1. Acesse Admin (admin@keahub.com)

### 2. Configure IA (Admin > Config. IA)
- Escolha provider: OpenAI, Groq ou Cerebras
- Insira chave de API
- Defina modelo (ex: gpt-4o-mini, llama-3.3-70b)
- Defina max_tokens (ex: 2000)
- Ative a configuração

### 3. Crie Agentes Especializados (Admin > Agentes IA)
- **Agente Cível**: Especializado em direito civil
- **Agente Trabalhista**: Especializado em direito do trabalho
- **Agente Tributário**: Especializado em direito tributário
- **Agente Penal**: Especializado em direito penal

Cada agente pode ter:
- Nome e descrição
- Provider e modelo próprio
- System prompt customizado
- Max tokens específico

### 4. Configure Usuários (Admin > Usuários)
- Crie usuários por escritório
- Atribua roles (admin, advogado, cliente)
- Ative/desative conforme necessário

---

## 📦 Build de Produção

### 1. Build
```bash
npm run build
```

### 2. Preview Local
```bash
npm run preview
```

### 3. Deploy
```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --prod

# Docker
docker build -t kealex-frontend .
docker run -p 3000:80 kealex-frontend
```

---

## 🌐 Proxy API

O Vite redireciona `/api/*` para `http://localhost:8000`:

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

---

## 📊 Estrutura de Pastas

```
src/
├── api/              # Clientes HTTP (axios)
│   ├── auth.ts
│   ├── processos.ts
│   ├── intimacoes.ts
│   ├── audiencias.ts
│   ├── financeiro.ts
│   └── ai.ts
├── components/       # Componentes reutilizáveis
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── ProcessoTimeline.tsx
│   ├── AreaChart.tsx
│   ├── Modal.tsx
│   └── ...
├── context/          # Context API
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/            # React Query hooks
│   ├── useProcessos.ts
│   ├── useIntimacoes.ts
│   ├── useAudiencias.ts
│   └── ...
├── pages/            # Páginas da aplicação
│   ├── LoginPage.tsx
│   ├── ProcessosPage.tsx
│   ├── IntimacoesPage.tsx
│   ├── AudienciasPage.tsx
│   ├── FinanceiroPage.tsx
│   ├── IAPage.tsx
│   └── ...
├── types/            # TypeScript types
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🔌 Endpoints Necessários (Backend)

### Autenticação
- `POST /auth/login` — Login
- `POST /auth/logout` — Logout
- `GET /auth/me` — Usuário atual

### Processos
- `GET /processos` — Listar
- `POST /processos` — Criar
- `PATCH /processos/:id` — Atualizar
- `DELETE /processos/:id` — Deletar

### Intimações
- `GET /intimacoes` — Listar
- `POST /intimacoes` — Criar
- `PATCH /intimacoes/:id` — Atualizar
- `DELETE /intimacoes/:id` — Deletar
- `POST /intimacoes/scan` — Varrer DJe

### Audiências
- `GET /audiencias` — Listar
- `POST /audiencias` — Criar
- `PATCH /audiencias/:id` — Atualizar
- `DELETE /audiencias/:id` — Deletar

### Financeiro
- `GET /honorarios` — Listar
- `POST /honorarios` — Criar
- `PATCH /honorarios/:id` — Atualizar
- `DELETE /honorarios/:id` — Deletar
- `GET /dashboard/financeiro` — Dashboard

### IA
- `GET /config-ia` — Configuração ativa
- `GET /agentes` — Listar agentes
- `POST /agentes` — Criar agente
- `PATCH /agentes/:id` — Atualizar agente

---

## 🧪 Testes

### Executar Testes
```bash
npm run test
```

### Testes E2E
```bash
npm run test:e2e
```

### Cobertura
```bash
npm run test:coverage
```

---

## 📚 Documentação

- **README.md** — Visão geral do projeto
- **IMPLEMENTACAO_COMPLETA.md** — Detalhes técnicos
- **GUIA_RAPIDO.md** — Guia de uso
- **CHECKLIST_TESTES.md** — Testes de validação

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'react'"
```bash
npm install
```

### Erro: "ECONNREFUSED 127.0.0.1:8000"
- Verifique se o backend está rodando
- Verifique a porta em `.env`

### Erro: "Invalid API key"
- Verifique a chave em Admin > Config. IA
- Teste em Admin > Debug API

### Tema não persiste
- Limpe localStorage: `localStorage.clear()`
- Recarregue a página

### Gráfico não renderiza
- Verifique se há dados de honorários
- Abra DevTools > Console para erros

---

## 📈 Performance

### Otimizações Implementadas
- ✅ Code splitting com React.lazy
- ✅ SVG charts (sem dependências pesadas)
- ✅ React Query caching
- ✅ Lazy loading de imagens
- ✅ Minificação de CSS/JS

### Métricas Alvo
- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.5s

---

## 🔒 Segurança

### Implementado
- ✅ JWT authentication
- ✅ HTTPS/SSL
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Input validation
- ✅ XSS protection

### Recomendações
- Usar variáveis de ambiente para chaves
- Implementar 2FA para admin
- Fazer backup regular de dados
- Monitorar logs de acesso
- Atualizar dependências regularmente

---

## 📞 Suporte

- **Email**: dev@kealabs.com
- **Slack**: #kealex-dev
- **GitHub Issues**: https://github.com/kealabs/ViewKealex/issues

---

## 📝 Changelog

### v1.0.0 (Atual)
- ✅ 8 módulos principais
- ✅ Dark/Light mode
- ✅ Split-screen workspace
- ✅ SVG charts
- ✅ Timeline de fases
- ✅ Intimações & DJe
- ✅ Audiências estratégicas

### v1.1.0 (Planejado)
- 📅 Integração com Zapier
- 📅 Exportação de relatórios
- 📅 Notificações push
- 📅 Integração com WhatsApp

---

**Plataforma pronta para deploy! 🚀**

Dúvidas? Consulte a documentação ou entre em contato com o suporte.
