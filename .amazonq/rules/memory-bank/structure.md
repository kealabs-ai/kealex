# Kealex - Project Structure

## Directory Organization

```
kealex/
├── src/
│   ├── api/                    # HTTP clients for backend communication
│   │   ├── agentes.ts         # Agent management endpoints
│   │   ├── ai.ts              # AI/Chat endpoints
│   │   ├── assinatura.ts      # Subscription management
│   │   ├── auth.ts            # Authentication (login, JWT)
│   │   ├── client.ts          # Axios client configuration
│   │   ├── clientes.ts        # Client management
│   │   ├── cobrancas.ts       # Collection/billing endpoints
│   │   ├── configuracoes.ts   # System configuration
│   │   ├── documentos.ts      # Document management
│   │   ├── escritorios.ts     # Law firm management
│   │   ├── financeiro.ts      # Financial/revenue endpoints
│   │   ├── prazos.ts          # Deadline management
│   │   ├── processos.ts       # Case management
│   │   └── usuarios.ts        # User management
│   │
│   ├── components/            # Reusable React components
│   │   ├── site/              # Landing page components
│   │   ├── AgentesDebugPanel.tsx      # Debug panel for agents
│   │   ├── AgentesTab.tsx             # Agents management UI
│   │   ├── AreaChart.tsx              # Chart component
│   │   ├── AssinaturaExistente.tsx    # Subscription display
│   │   ├── AssinaturaModal.tsx        # Subscription modal
│   │   ├── Badge.tsx                  # Status badge component
│   │   ├── Calendar.tsx               # Calendar with day view
│   │   ├── Cards.tsx                  # Card components
│   │   ├── CobrancaFluxo.tsx          # Collection flow visualization
│   │   ├── CookieConsent.tsx          # Cookie consent banner
│   │   ├── ErrorBoundary.tsx          # Error boundary wrapper
│   │   ├── IATab.tsx                  # AI assistant tab
│   │   ├── MarkdownRenderer.tsx       # Markdown to HTML renderer
│   │   ├── Modal.tsx                  # Modal dialog component
│   │   ├── ModalidadeModal.tsx        # Modality selection modal
│   │   ├── ProcessoTimeline.tsx       # Case timeline component
│   │   ├── ProgressStepper.tsx        # Progress indicator
│   │   ├── ProtectedLayout.tsx        # Auth-protected layout wrapper
│   │   ├── Sidebar.tsx                # Navigation sidebar
│   │   ├── Toast.tsx                  # Toast notifications
│   │   ├── TopBar.tsx                 # Top navigation bar
│   │   ├── UI.tsx                     # Generic UI utilities
│   │   └── UserMenu.tsx               # User profile menu
│   │
│   ├── context/               # React Context for global state
│   │   ├── AuthContext.tsx    # Authentication state (JWT, user, role)
│   │   └── ThemeContext.tsx   # Light/dark theme state
│   │
│   ├── hooks/                 # Custom React hooks (React Query)
│   │   ├── useAgentes.ts      # Agent data fetching
│   │   ├── useClientes.ts     # Client data fetching
│   │   ├── useCobrancaFluxo.ts # Collection flow data
│   │   ├── useConfiguracoes.ts # System config data
│   │   ├── useDocumentos.ts   # Document data fetching
│   │   ├── useFinanceiro.ts   # Financial data fetching
│   │   ├── useIntimacoes.ts   # Intimation data fetching
│   │   ├── usePrazos.ts       # Deadline data fetching
│   │   ├── useProcessos.ts    # Case data fetching
│   │   ├── useTrial.ts        # Trial period data
│   │   └── useUsuarios.ts     # User data fetching
│   │
│   ├── pages/                 # Page components (routes)
│   │   ├── site/              # Landing page routes
│   │   ├── AdminPage.tsx      # System administration
│   │   ├── AudienciasPage.tsx # Hearings management
│   │   ├── ClientesPage.tsx   # Client management
│   │   ├── CobrancaPage.tsx   # Collection management
│   │   ├── DocumentosPage.tsx # Document management
│   │   ├── ErrorPage.tsx      # Error display page
│   │   ├── FinanceiroPage.tsx # Financial dashboard
│   │   ├── IAPage.tsx         # AI assistant interface
│   │   ├── IntimacoesPage.tsx # Intimations management
│   │   ├── LoginPage.tsx      # Authentication page
│   │   ├── NotFoundPage.tsx   # 404 page
│   │   ├── PagamentoPendentePage.tsx # Payment pending page
│   │   ├── PrazosPage.tsx     # Deadline management
│   │   ├── ProcessosPage.tsx  # Case management
│   │   ├── TrialExpiradoPage.tsx # Trial expired page
│   │   └── UsuariosPage.tsx   # User management
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # All shared types and interfaces
│   │
│   ├── utils/                 # Utility functions
│   │   ├── documentGenerator.ts # Word document generation
│   │   ├── formatters.ts      # Data formatting utilities
│   │   ├── guiaGenerator.ts   # Guide/document generation
│   │   └── logger.ts          # Logging utilities
│   │
│   ├── assets/                # Static images and media
│   ├── App.tsx                # Root component with routing
│   ├── App.css                # Global styles
│   ├── index.css              # Tailwind CSS imports
│   └── main.tsx               # React entry point
│
├── public/                    # Static files served as-is
│   ├── .htaccess             # Apache configuration
│   ├── favicon.svg           # Browser tab icon
│   ├── icons.svg             # Icon sprite
│   ├── og-image.jpg          # Open Graph image
│   └── og-image.svg          # Open Graph SVG
│
├── migrations/                # Database migrations
│   └── add_email_whatsapp_to_tenants.sql
│
├── scripts/                   # Build and utility scripts
│   └── generate-og-image.mjs  # OG image generation
│
├── knowledge/                 # Project documentation
│   └── *.md                   # Various documentation files
│
├── .env                       # Environment variables (local)
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependency versions
├── tsconfig.json              # TypeScript root config
├── tsconfig.app.json          # TypeScript app config
├── tsconfig.node.json         # TypeScript node config
├── vite.config.ts             # Vite build configuration
└── test-*.js                  # Test scripts
```

## Core Components & Relationships

### Authentication Flow
```
LoginPage → AuthContext (JWT storage) → ProtectedLayout → Protected Routes
                ↓
         Axios Interceptor (auto-inject token)
                ↓
         Backend API (/api/*)
```

### Data Fetching Pattern
```
Pages → Custom Hooks (useX) → React Query → API Clients → Backend
                                    ↓
                            Cache Management
```

### State Management
- **Global State**: AuthContext (user, token, role), ThemeContext (light/dark)
- **Server State**: React Query (caching, invalidation, refetching)
- **Local State**: Component useState for UI state

### Component Hierarchy
```
App.tsx
├── AuthContext Provider
├── ThemeContext Provider
├── Router
│   ├── LoginPage (public)
│   ├── ProtectedLayout (private)
│   │   ├── Sidebar
│   │   ├── TopBar
│   │   └── Page Routes
│   │       ├── ProcessosPage
│   │       ├── DocumentosPage
│   │       ├── PrazosPage
│   │       ├── FinanceiroPage
│   │       ├── CobrancaPage
│   │       ├── IAPage
│   │       ├── AdminPage
│   │       └── ...
│   └── Error Pages
```

## Architectural Patterns

### API Client Pattern
Each domain has a dedicated API client module:
- Centralized axios instance with interceptors
- Consistent error handling
- JWT token injection
- Request/response transformation

### Hook Pattern (React Query)
Custom hooks encapsulate:
- Query configuration (staleTime, retry)
- Mutation handlers
- Cache invalidation logic
- Error handling

### Component Composition
- Presentational components (UI, Cards, Badge)
- Container components (Pages)
- Layout components (ProtectedLayout, Sidebar)
- Utility components (ErrorBoundary, Toast)

### Context Pattern
- AuthContext: User authentication state
- ThemeContext: UI theme preference
- Providers wrap App root for global access

## Data Flow

### Case Management Flow
```
ProcessosPage
  ↓
useProcessos hook (React Query)
  ↓
processos.ts API client
  ↓
Backend /api/processos
  ↓
Database
```

### AI Chat Flow
```
IAPage
  ↓
IATab component
  ↓
ai.ts API client (streaming)
  ↓
OpenAI API
  ↓
MarkdownRenderer (display)
  ↓
documentGenerator (export to .docx)
```

### Collection Management Flow
```
CobrancaPage
  ↓
useCobrancaFluxo hook
  ↓
CobrancaFluxo component (visualization)
  ↓
cobrancas.ts API client
  ↓
Backend /api/cobrancas
```

## Build & Deployment

### Build Process
- TypeScript compilation: `tsc -b`
- Vite bundling: `vite build`
- Output: `dist/` directory
- Optimization: Tree-shaking, code splitting, minification

### Development Server
- Vite dev server on port 5173
- Hot Module Replacement (HMR)
- API proxy to backend (port 8000)
- Proxy routes: `/api/*`, `/v1/*`, `/k1/*`

### Environment Configuration
- `.env` file for local development
- `KEALEX_API_BASE_URL`: Backend API URL
- `KEALEX_OPENAI_API_KEY`: OpenAI API key
- Vite `define` for runtime environment variables

## Subscription and Renewal UI

- `src/api/assinatura.ts` defines subscription checkout and billing-status types, including `subscriptionExpiresAt`.
- `src/components/AssinaturaModal.tsx` is the authenticated subscription/payment modal; `src/pages/site/AssinaturaPage.tsx` provides public signup checkout.
- `src/components/CardBrandIndicator.tsx` is shared by both card forms to display the detected card brand.
- `src/components/TopBar.tsx` reads billing status, presents renewal messaging within 10 days of expiration, and opens `AssinaturaModal` from the renewal action.
- The backend owns Asaas customer/subscription creation, payment confirmation, webhook event storage, and access-period grants. The frontend displays returned status and expiration information.
