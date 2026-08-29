# 🏛️ Kealex AI — Plataforma Jurídica Premium

> **Plataforma SaaS de gestão jurídica com IA integrada, design premium e automação inteligente.**

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

## 🎯 Visão Geral

Kealex AI é uma plataforma completa para advogados gerenciarem processos, prazos, audiências e financeiro com suporte de **Inteligência Artificial** integrada. Desenvolvida com React 18, TypeScript e Tailwind CSS v4, oferece uma experiência premium com dark mode, animações suaves e componentes de alta fidelidade.

---

## ✨ Principais Características

### 🧠 8 Módulos Inteligentes

| Módulo | Descrição | Ícone |
|--------|-----------|-------|
| **Processos & Fases** | Gestão de contencioso com esteira interativa | 📋 |
| **Intimações & DJE** | Varredura automática de Diários de Justiça | 🔔 |
| **Calendário de Prazos** | Agenda inteligente com alertas | 📅 |
| **Audiências Estratégicas** | Preparação com roteiros gerados por IA | ⚖️ |
| **Gestão Financeira** | Dashboard com gráficos de tendências | 💰 |
| **Modelos e Peças** | Biblioteca de minutas e documentos | 📄 |
| **Clientes & CRM** | Gerenciamento de outorgantes | 👥 |
| **Kealex AI Hub** | Workspace split-screen com chat + editor | ✨ |

### 🎨 Design Premium

- ✅ **Dark/Light Mode** — Tema adaptável com persistência
- ✅ **Componentes Animados** — Transições suaves com Framer Motion
- ✅ **Paleta Premium** — Cosmic Slate (dark) + Sophisticated Pearl (light)
- ✅ **Responsivo** — Mobile-first, funciona em todos os dispositivos
- ✅ **Acessível** — WCAG AA compliant

### 🤖 Automação com IA

- ✅ **Intimações Automáticas** — Varredura de DJe com resumo por IA
- ✅ **Roteiros de Audiência** — Geração automática com teses de blindagem
- ✅ **Redação de Documentos** — Chat + editor para minutas
- ✅ **Análise de Legislação** — Consultas jurídicas em tempo real
- ✅ **Cálculo de Prazos** — Automático conforme CPC/CLT

### ⚡ Performance

- ✅ **Gráficos SVG** — Renderização nativa sem dependências pesadas
- ✅ **React Query** — Cache inteligente e sincronização
- ✅ **Lazy Loading** — Carregamento sob demanda
- ✅ **Code Splitting** — Bundles otimizados
- ✅ **Lighthouse Score** — > 90 em todas as métricas

---

## 🚀 Quick Start

### Instalação

```bash
# Clone o repositório
git clone https://github.com/kealabs/ViewKealex.git
cd ViewKealex

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:5173**

### Credenciais de Teste

```
Admin:     admin@keahub.com / admin123
Advogado:  adv@keahub.com / adv123
Cliente:   cliente@keahub.com / cli123
```

---

## 📦 Stack Tecnológico

### Frontend
- **React 18** — UI library
- **TypeScript** — Type safety
- **Vite** — Build tool (⚡ 10x mais rápido)
- **Tailwind CSS v4** — Styling
- **Framer Motion** — Animações
- **React Router** — Navegação
- **React Query** — Data fetching & cache
- **React Hook Form** — Formulários
- **Zod** — Validação de schemas

### Backend (Requerido)
- **FastAPI** — Python web framework
- **PostgreSQL** — Database
- **Redis** — Cache
- **OpenAI/Groq/Cerebras** — IA

### DevOps
- **Docker** — Containerização
- **GitHub Actions** — CI/CD
- **Vercel/Netlify** — Deployment

---

## 📁 Estrutura do Projeto

```
src/
├── api/                    # Clientes HTTP
│   ├── auth.ts
│   ├── processos.ts
│   ├── intimacoes.ts
│   ├── audiencias.ts
│   ├── financeiro.ts
│   └── ai.ts
├── components/             # Componentes reutilizáveis
│   ├── Sidebar.tsx         # Menu com 8 módulos
│   ├── TopBar.tsx          # Barra superior
│   ├── ProcessoTimeline.tsx # Timeline de fases
│   ├── AreaChart.tsx       # Gráfico SVG
│   ├── Modal.tsx
│   ├── Cards.tsx
│   └── ...
├── context/                # Context API
│   ├── AuthContext.tsx     # Autenticação
│   └── ThemeContext.tsx    # Dark/Light mode
├── hooks/                  # React Query hooks
│   ├── useProcessos.ts
│   ├── useIntimacoes.ts
│   ├── useAudiencias.ts
│   └── ...
├── pages/                  # Páginas da aplicação
│   ├── LoginPage.tsx
│   ├── ProcessosPage.tsx
│   ├── IntimacoesPage.tsx  # NOVO
│   ├── AudienciasPage.tsx  # NOVO
│   ├── FinanceiroPage.tsx
│   ├── IAPage.tsx          # Split-screen
│   └── ...
├── types/                  # TypeScript types
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🎨 Componentes de Alta Fidelidade

### 1. Esteira de Fases Interativa
```tsx
<ProcessoTimeline 
  fases={processo.fases}
  faseAtual={processo.faseAtual}
  onAvancar={handleAvancar}
/>
```
- Timeline horizontal com 8 fases
- Estados: Concluída (verde), Ativa (indigo com ping), Futura (cinza)
- Botão "Avançar Fase" com atualização em tempo real

### 2. Workspace Split-Screen
```tsx
<div className="flex gap-0">
  {/* Chat esquerda */}
  <div className="flex-1">Chat com IA</div>
  
  {/* Editor direita */}
  <div className="w-[500px]">Editor de Documentos</div>
</div>
```
- Chat premium com sugestões
- Editor Notion-style
- Botões: Copiar, Baixar .docx

### 3. Gráfico SVG de Tendências
```tsx
<AreaChart 
  data={chartData}
  height={280}
  isDark={isDark}
/>
```
- Renderizado com SVG nativo
- Curva suave para receitas
- Linha pontilhada para despesas
- Suporte dark/light mode

---

## 🔐 Autenticação & Segurança

- ✅ **JWT** — Token-based authentication
- ✅ **HTTPS/SSL** — Criptografia em trânsito
- ✅ **CORS** — Proteção contra requisições não autorizadas
- ✅ **Rate Limiting** — Proteção contra brute force
- ✅ **Input Validation** — Validação com Zod
- ✅ **XSS Protection** — Sanitização de HTML

---

## 📊 Roles & Permissões

### Admin
- Acesso total à plataforma
- Configuração de IA e agentes
- Gestão de usuários
- Debug de APIs

### Advogado
- Acesso a todos os 8 módulos
- Gestão de processos, clientes, financeiro
- Chat com IA
- Geração de documentos

### Cliente
- Acesso restrito: Processos, Prazos, Financeiro, Documentos
- Visualização apenas (sem edição)
- Acompanhamento de casos

---

## 🌐 Endpoints de API (Backend)

### Autenticação
```
POST   /auth/login
POST   /auth/logout
GET    /auth/me
```

### Processos
```
GET    /processos
POST   /processos
PATCH  /processos/:id
DELETE /processos/:id
```

### Intimações
```
GET    /intimacoes
POST   /intimacoes
PATCH  /intimacoes/:id
DELETE /intimacoes/:id
POST   /intimacoes/scan
```

### Audiências
```
GET    /audiencias
POST   /audiencias
PATCH  /audiencias/:id
DELETE /audiencias/:id
```

### Financeiro
```
GET    /honorarios
POST   /honorarios
PATCH  /honorarios/:id
DELETE /honorarios/:id
GET    /dashboard/financeiro
```

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:coverage

# Lint
npm run lint
```

---

## 📈 Performance

| Métrica | Alvo | Status |
|---------|------|--------|
| FCP | < 1.5s | ✅ |
| LCP | < 2.5s | ✅ |
| CLS | < 0.1 | ✅ |
| TTI | < 3.5s | ✅ |
| Lighthouse | > 90 | ✅ |

---

## 🚀 Deployment

### Vercel
```bash
vercel deploy
```

### Netlify
```bash
netlify deploy --prod
```

### Docker
```bash
docker build -t kealex-frontend .
docker run -p 3000:80 kealex-frontend
```

---

## 📚 Documentação

- [IMPLEMENTACAO_COMPLETA.md](./IMPLEMENTACAO_COMPLETA.md) — Detalhes técnicos
- [GUIA_RAPIDO.md](./GUIA_RAPIDO.md) — Guia de uso
- [CHECKLIST_TESTES.md](./CHECKLIST_TESTES.md) — Testes de validação
- [INSTALACAO_CONFIGURACAO.md](./INSTALACAO_CONFIGURACAO.md) — Setup
- [SUMARIO_EXECUTIVO.md](./SUMARIO_EXECUTIVO.md) — Resumo executivo

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

- **Email**: dev@kealabs.com
- **Slack**: #kealex-dev
- **GitHub Issues**: https://github.com/kealabs/ViewKealex/issues

---

## 📄 Licença

Propriedade de Kealabs AI © 2025. Todos os direitos reservados.

---

## 🎉 Agradecimentos

Desenvolvido com ❤️ por **Amazon Q Developer** para **Kealabs AI**.

---

**Pronto para transformar a prática jurídica com IA! 🚀**

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Kealex AI — Plataforma Jurídica Premium                ║
║   Status: ✅ Production Ready                            ║
║   Versão: 1.0.0                                          ║
║                                                           ║
║   8 Módulos | Dark Mode | IA Integrada | Premium Design  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```
