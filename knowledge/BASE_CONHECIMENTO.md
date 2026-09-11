# Kealex — Base de Conhecimento Completa

> Plataforma SaaS jurídica com IA para escritórios de advocacia.  
> Stack: React + TypeScript + Vite + TailwindCSS + TanStack Query  
> Backend: `https://srv1023256.hstgr.cloud` — prefixo `/k1/lex/`

---

## 1. Arquitetura Geral

```
src/
├── api/          # Clientes HTTP (axios) por domínio
├── components/   # Componentes reutilizáveis
├── context/      # AuthContext, ThemeContext
├── hooks/        # React Query hooks por domínio
├── pages/        # Páginas da aplicação
├── types/        # Tipos TypeScript globais
└── utils/        # Geradores de documentos e guias
```

### Proxy Vite (dev)
| Prefixo | Destino |
|---------|---------|
| `/k1`   | `https://srv1023256.hstgr.cloud` (direto) |
| `/api`  | `https://srv1023256.hstgr.cloud` (rewrite remove `/api`) |

### CSP (index.html)
```
worker-src blob:
script-src 'self' 'unsafe-eval' 'unsafe-inline'
connect-src 'self' localhost https://srv1023256.hstgr.cloud https://api.openai.com https://api.groq.com
```

---

## 2. Autenticação

- **Armazenamento:** `localStorage` — chaves `kealex_token` (JWT) e `kealex_user` (JSON)
- **Validação:** JWT decodificado no cliente, verifica `exp` a cada 60s e no foco da janela
- **Roles:** `admin` | `advogado` | `cliente`
- **Redirecionamento:** 401 → `/login` (exceto se já estiver em `/login`)
- **Contexto:** `AuthContext` expõe `user`, `role`, `login()`, `logout()`

### Permissões por role
| Funcionalidade | admin | advogado | cliente |
|---|---|---|---|
| Criar/editar processos | ✅ | ✅ | ❌ |
| Ver processos | ✅ | ✅ | ✅ (próprios) |
| Criar honorários | ✅ | ✅ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ |
| Painel Admin | ✅ | ❌ | ❌ |
| Criar documentos | ✅ | ✅ | ❌ |
| Ver documentos | ✅ | ✅ | ✅ (próprios) |

---

## 3. Rotas da Aplicação

| Rota | Componente | Proteção |
|------|-----------|----------|
| `/` | LandingPage | Pública |
| `/entrar` | LoginPage | Pública |
| `/login` | → redirect `/entrar` | Pública |
| `/lgpd` `/privacidade` | LGPDPage | Pública |
| `/termos` `/termos-de-uso` | TermosPage | Pública |
| `/error` | ErrorPage | Pública |
| `/processos` | ProcessosPage | Autenticado |
| `/documentos` | DocumentosPage | Autenticado |
| `/prazos` | PrazosPage | Autenticado |
| `/financeiro` | FinanceiroPage | Autenticado |
| `/cobranca` | CobrancaPage | Autenticado |
| `/usuarios` | UsuariosPage | Autenticado |
| `/clientes` | ClientesPage | Autenticado |
| `/admin` | AdminPage | Autenticado |
| `/ia` | IAPage | Autenticado |
| `/intimacoes` | IntimacoesPage | Autenticado |
| `/audiencias` | AudienciasPage | Autenticado |
| `/app` | → redirect `/processos` | Autenticado |

---

## 4. Módulos e Funcionalidades

---

### 4.1 Processos (`/processos`)

**Endpoint:** `GET/POST/PUT/DELETE /k1/lex/processos`

**Campos:**
```ts
numero, titulo, descricao, status, advogadoId,
clienteId, clienteNome, vara, tribunal,
fases: FaseProcesso[], faseAtual: number
```

**Status:** `ativo` | `arquivado` | `encerrado`

**Funcionalidades:**
- Listar processos com busca por título e número
- Criar processo com fases customizadas (ou usar padrão)
- Editar processo (número, título, vara, tribunal, status, cliente)
- Excluir processo
- **Timeline de fases** — expansível por processo, mostra progresso visual
- **Avançar fase** — botão na timeline, chama `PUT /k1/lex/processos/:id/fase`
- **Emitir Guia TJMG** — gera PDF com código de barras para pagamento
  - Tipos: custas processuais, honorários periciais, depósito judicial, multa, outro
  - Campos: valor, vencimento, descrição
- Filtro por status (ativo/arquivado/encerrado)
- Stats: Total, Ativos, Arquivados, Encerrados
- Cliente vê apenas seus processos (somente leitura)

**Fases padrão do processo:**
Distribuição → Citação → Contestação → Audiência → Sentença → Trânsito em Julgado

---

### 4.2 Clientes (`/clientes`)

**Endpoint:** `GET/POST/PUT/DELETE /k1/lex/clientes`

**Campos:**
```ts
nome, email, telefone?, cpfCnpj?, endereco?, observacoes?
```

**Funcionalidades:**
- Listar clientes com busca por nome e email
- Criar, editar e excluir cliente
- Stats: Total, Com telefone, Com CPF/CNPJ, Com endereço
- Avatar com iniciais do nome

---

### 4.3 Documentos (`/documentos`)

**Endpoint:** `GET/POST/PUT/DELETE /k1/lex/documentos`

**Campos:**
```ts
processoId, nome, tipo, status, urlArquivo, tamanhoBytes
```

**Tipos:** `peticao` | `contrato` | `comprovante` | `outro`  
**Status:** `pendente` | `aprovado` | `rejeitado`

**Funcionalidades:**
- Listar documentos com busca por nome
- Criar documento via **URL externa** ou **upload de arquivo**
- Editar documento (nome, tipo, status)
- Excluir documento
- Download direto do arquivo
- Abrir arquivo em nova aba
- Stats: Total, Aprovados, Pendentes, Rejeitados
- Ícones por tipo: 📄 petição, 📋 contrato, 🧾 comprovante, 📁 outro
- Cliente vê apenas documentos dos seus processos (somente leitura)

---

### 4.4 Prazos (`/prazos`)

**Endpoint:** `GET/POST/PUT/DELETE /k1/lex/prazos`

**Campos:**
```ts
processoId, titulo, descricao, dataVencimento, status
```

**Status:** `pendente` | `concluido` | `vencido`

**Funcionalidades:**
- Listar prazos com busca por título
- Criar, editar e excluir prazo
- **Alerta visual** para prazos vencendo nos próximos 7 dias
- **Destaque vermelho** para prazos com ≤ 3 dias
- Contador de dias restantes (ex: "5d", "Hoje", "3d atrás")
- **Calendário lateral** com marcação visual dos prazos por data
- Stats: Total, Pendentes, Concluídos, Vencidos
- Cliente vê apenas prazos dos seus processos (somente leitura)

---

### 4.5 Financeiro (`/financeiro`)

**Endpoint:** `GET/POST/PUT/DELETE /k1/lex/honorarios`  
**Dashboard:** `GET /k1/lex/honorarios/dashboard`

**Campos:**
```ts
processoId, clienteId, descricao, valorCentavos,
dataVencimento, dataPagamento?, status
```

**Status:** `pendente` | `pago` | `vencido` | `cancelado`

**Funcionalidades:**
- Listar honorários com busca por descrição
- Criar, editar e excluir honorário
- **Alerta** para honorários vencendo nos próximos 7 dias
- **KPIs avançados** (apenas admin/advogado):
  - Ticket médio por honorário pago
  - Taxa de adimplência (%) com barra de progresso
  - Taxa de inadimplência (%) com barra de progresso
  - Receita por processo ativo
  - Previsão de receita para 3 meses
  - Previsão de receita para 6 meses
  - Próximo vencimento com dias restantes
- **Gráfico de área** — tendência financeira dos últimos 6 meses (receitas vs despesas)
- Stats: Total Geral, Pago, Pendente, Vencido
- Valores em centavos internamente, exibidos em BRL formatado
- Cliente vê labels adaptados: "Total a Pagar", "Já Pago", "Em Aberto", "Atrasado"

---

### 4.6 Cobrança (`/cobranca`)

**Endpoint:** `GET/POST /k1/lex/cobrancas`  
**Ações:** `POST /k1/lex/cobrancas/:id/proxima-fase`, `/marcar-pago`, `/cancelar`  
**Timeline:** `GET /k1/lex/cobrancas/:id/timeline`

**Campos:**
```ts
processoId, clienteId, valorCentavos, status,
faseAtual, faseLabel, dataVencimento?, dataPagamento?,
motivoCancelamento?
```

**Status:** `pendente` | `pago` | `cancelado`

**Funcionalidades:**
- Listar cobranças em cards (grid 2 colunas)
- Criar cobrança vinculada a cliente + processo
  - Seleção de processo filtrada pelo cliente selecionado
  - Preview do vínculo antes de confirmar
- **Fluxo de fases** — avançar fase da cobrança (ex: notificação → protesto → judicial)
- Marcar como pago
- Cancelar cobrança
- **Timeline** de cada cobrança carregada sob demanda
- Filtros: Todos | Pendente | Pago | Cancelado
- Busca por cliente, processo ou número
- Stats: Total em Cobrança, Pendentes, Em Cobrança, Pagos

---

### 4.7 Usuários (`/usuarios` e `/admin?tab=usuarios`)

**Endpoint:** `GET/POST/PUT/DELETE /k1/lex/usuarios`

**Campos:**
```ts
nome, email, senha?, role: 'admin'|'advogado'|'cliente', ativo: boolean
```

**Funcionalidades (ambas as páginas):**
- Listar todos os usuários com busca por nome e email
- Criar usuário com role e senha
- **Ver detalhes** — modal com nome, email, role e status
- **Toggle ativo/inativo** — direto na linha sem abrir modal
- **Editar** — modal com formulário (senha opcional na edição)
- **Excluir** — modal de confirmação antes de deletar
- Stats: Total, Admins, Advogados, Clientes
- Avatar com iniciais e cor por role:
  - Admin: roxo/índigo
  - Advogado: azul/ciano
  - Cliente: verde/esmeralda

---

### 4.8 Intimações (`/intimacoes`)

**Status:** `nova` | `lida` | `respondida` | `ignorada`

**Funcionalidades:**
- Central de triagem de publicações em Diários de Justiça
- **Varrer Diários** — simula scan do DJe com animação de loading
- Listar intimações com busca por processo, número ou diário
- **Resumo por IA** — exibido em destaque para cada intimação
- **Prazo calculado** — data calculada automaticamente pela IA
- Expandir texto completo da publicação
- Marcar intimação como lida
- Stats: Total, Novas, Lidas, Respondidas
- Indicador pulsante (●) para intimações novas

---

### 4.9 Audiências (`/audiencias`)

**Status:** `agendada` | `realizada` | `cancelada` | `adiada`

**Tipos:** Conciliação | Instrução | Julgamento | Mediação | Depoimento Pessoal

**Funcionalidades:**
- Listar audiências com badge de data visual (dia + mês)
- Criar audiência (processo, tipo, data/hora, local, juiz, partes)
- **Gerar Roteiro por IA** — gera roteiro estratégico com:
  - Objetivos da audiência
  - Pontos-chave para negociação
  - Perguntas para testemunhas/parte contrária
  - Teses de blindagem com jurisprudência
  - Pedidos a formular
- Expandir/recolher roteiro na lista
- Stats: Total, Agendadas, Realizadas, Canceladas

---

### 4.10 IA — Kealex AI Hub (`/ia`)

**Providers suportados:** `groq` | `cerebras`

**Funcionalidades:**
- **Chat jurídico** com streaming de respostas
- **Seletor de agente** — troca de agente IA em tempo real
- **Prompts sugeridos** (8 temas jurídicos pré-definidos):
  - Prazos processuais (CPC)
  - Petição inicial (art. 319 CPC)
  - Contrato de honorários
  - Recurso de apelação
  - Rescisão trabalhista
  - Usucapião
  - Habeas corpus
  - Execução fiscal
- **Ações rápidas:** "Analise este contrato:", "Redija uma petição para:", etc.
- **Editor de documentos** (painel direito):
  - Exibe respostas da IA formatadas
  - Exportar conversa como `.docx`
- Copiar mensagem individual
- Limpar conversa
- Suporte a Markdown nas respostas
- Enter para enviar, Shift+Enter para nova linha
- Aviso quando nenhum agente está configurado

---

### 4.11 Admin (`/admin`)

Tabs disponíveis via `?tab=`:

| Tab | Descrição |
|-----|-----------|
| `geral` | Nome da plataforma, URL, email suporte, timezone, idioma |
| `cdn` | Provider (S3/Cloudflare/Azure/Bunny.net), bucket, extensões, Panda Video |
| `database` | Pool size, timeout, SSL, query logging, read replicas, backup |
| `usuarios` | CRUD completo de usuários (igual à `/usuarios`) |
| `ia` | Configuração de agentes de IA |
| `agentes` | Gerenciamento de agentes |
| `debug` | Painel de debug dos agentes |
| `seguranca` | 2FA, whitelist de IPs, rate limit, expiração JWT |
| `notificacoes` | SMTP (email), SMS (Twilio/AWS SNS/Zenvia) |

**Database tab extras:**
- Visualizar variáveis de ambiente do Easypanel (host, porta, database, usuário, senha mascarada, connection string)
- Botão de atualizar variáveis
- Executar backup manual
- Ver logs de backup

---

## 5. Componentes Reutilizáveis

### Cards (`src/components/Cards.tsx`)
| Componente | Uso |
|-----------|-----|
| `StatCard` | Card de métrica com gradiente, ícone e valor |
| `DataCard` | Container branco com sombra para tabelas/listas |
| `SkeletonRow` | Linha de loading (variante `table` ou `list`) |
| `EmptyState` | Estado vazio com ícone e mensagem |

### UI (`src/components/UI.tsx`)
| Componente | Props relevantes |
|-----------|-----------------|
| `Button` | `variant`: primary/secondary/danger/ghost, `loading`, `icon` |
| `Input` | `label`, `error` |
| `Select` | `label` |
| `Textarea` | `label` |

### Outros
| Componente | Descrição |
|-----------|-----------|
| `Modal` | Modal animado com backdrop blur, tamanhos sm/md/lg |
| `Badge` | Badge colorido com variantes |
| `roleBadge()` | Badge específico por role de usuário |
| `Calendar` | Calendário com marcação de prazos |
| `ProcessoTimeline` | Timeline visual de fases do processo |
| `CobrancaFluxo` | Card de cobrança com fluxo de fases |
| `AreaChart` | Gráfico de área para financeiro |
| `MarkdownRenderer` | Renderiza markdown das respostas da IA |
| `Sidebar` | Menu lateral de navegação |
| `TopBar` / `Topbar` | Barra superior com título, subtítulo e ações |
| `ProtectedLayout` | Wrapper de rotas autenticadas |
| `ErrorBoundary` | Captura erros de renderização |

---

## 6. Tipos Principais

```ts
type Role = 'admin' | 'advogado' | 'cliente'
type StatusProcesso = 'ativo' | 'arquivado' | 'encerrado'
type TipoDocumento = 'peticao' | 'contrato' | 'comprovante' | 'outro'
type StatusDocumento = 'pendente' | 'aprovado' | 'rejeitado'
type StatusHonorario = 'pendente' | 'pago' | 'vencido' | 'cancelado'
type StatusPrazo = 'pendente' | 'concluido' | 'vencido'
type StatusIntimacao = 'nova' | 'lida' | 'respondida' | 'ignorada'
type StatusAudiencia = 'agendada' | 'realizada' | 'cancelada' | 'adiada'
type StatusCobranca = 'pendente' | 'pago' | 'cancelado'
type AIProvider = 'cerebras' | 'groq'
```

---

## 7. Endpoints da API

| Método | Endpoint | Descrição |
|--------|---------|-----------|
| POST | `/k1/lex/auth/login` | Login |
| GET | `/k1/lex/processos` | Listar processos |
| POST | `/k1/lex/processos` | Criar processo |
| PUT | `/k1/lex/processos/:id` | Editar processo |
| DELETE | `/k1/lex/processos/:id` | Excluir processo |
| PUT | `/k1/lex/processos/:id/fase` | Avançar fase |
| GET | `/k1/lex/clientes` | Listar clientes |
| POST | `/k1/lex/clientes` | Criar cliente |
| PUT | `/k1/lex/clientes/:id` | Editar cliente |
| DELETE | `/k1/lex/clientes/:id` | Excluir cliente |
| GET | `/k1/lex/documentos` | Listar documentos |
| POST | `/k1/lex/documentos` | Criar documento |
| PUT | `/k1/lex/documentos/:id` | Editar documento |
| DELETE | `/k1/lex/documentos/:id` | Excluir documento |
| GET | `/k1/lex/prazos` | Listar prazos |
| GET | `/k1/lex/prazos/vencendo/:dias` | Prazos vencendo em N dias |
| POST | `/k1/lex/prazos` | Criar prazo |
| PUT | `/k1/lex/prazos/:id` | Editar prazo |
| DELETE | `/k1/lex/prazos/:id` | Excluir prazo |
| GET | `/k1/lex/honorarios` | Listar honorários |
| GET | `/k1/lex/honorarios/dashboard` | Dashboard financeiro |
| POST | `/k1/lex/honorarios` | Criar honorário |
| PUT | `/k1/lex/honorarios/:id` | Editar honorário |
| DELETE | `/k1/lex/honorarios/:id` | Excluir honorário |
| GET | `/k1/lex/cobrancas` | Listar cobranças |
| POST | `/k1/lex/cobrancas` | Criar cobrança |
| POST | `/k1/lex/cobrancas/:id/proxima-fase` | Avançar fase cobrança |
| POST | `/k1/lex/cobrancas/:id/marcar-pago` | Marcar pago |
| POST | `/k1/lex/cobrancas/:id/cancelar` | Cancelar cobrança |
| GET | `/k1/lex/cobrancas/:id/timeline` | Timeline da cobrança |
| GET | `/k1/lex/usuarios` | Listar usuários |
| POST | `/k1/lex/usuarios` | Criar usuário |
| PUT | `/k1/lex/usuarios/:id` | Editar usuário |
| DELETE | `/k1/lex/usuarios/:id` | Excluir usuário |
| GET | `/k1/lex/configuracoes/database` | Config do banco |
| POST | `/k1/lex/configuracoes/database` | Salvar config banco |
| GET | `/k1/lex/configuracoes/database/env` | Variáveis de ambiente |
| GET | `/k1/lex/configuracoes/ia/ativa` | Config IA ativa |
| GET | `/k1/lex/agentes` | Listar agentes IA |
| GET | `/k1/lex/agentes/publicos` | Agentes públicos |

---

## 8. Utilitários

### `guiaGenerator.ts`
Gera PDF de guia de pagamento TJMG com:
- Cabeçalho com símbolo da justiça
- Dados do processo (número, vara, tribunal)
- Dados do pagamento (tipo, valor, vencimento)
- Código de barras simulado
- Download automático

### `documentGenerator.ts`
Gera arquivo `.docx` a partir da conversa do chat IA:
- Título do documento
- Conteúdo das mensagens do assistente
- Nome do usuário no rodapé

---

## 9. Temas

- **Light/Dark mode** via `ThemeContext`
- Toggle disponível na interface
- Classes Tailwind com prefixo `dark:` em todos os componentes
- Persistência do tema no localStorage

---

## 10. Problemas Conhecidos e Soluções

| Problema | Causa | Solução |
|---------|-------|---------|
| 404 em `/k1/lex/usuarios/list` | Rota `:id` no backend captura `list` como ID | Registrar rota `/list` antes de `/:id` no backend |
| Worker blob bloqueado (CSP) | `worker-src` não definido no CSP | Adicionar `worker-src blob:` no meta CSP do `index.html` |
| Ícones de ação não aparecem | Classes Tailwind purgadas ou `opacity-0` sem hover | Usar `style` inline nos botões de ação |
| Token expirado sem redirect | Interceptor só redireciona em 401 com mensagem específica | Verificado — comportamento intencional para não redirecionar em 404 |
