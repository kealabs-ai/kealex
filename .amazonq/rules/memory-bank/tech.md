# Kealex - Technology Stack

## Core Technologies

### Frontend Framework
- **React**: 19.2.5 - UI library with hooks and concurrent features
- **TypeScript**: ~6.0.2 - Static typing for JavaScript
- **Vite**: 8.0.10 - Next-generation build tool with HMR

### Styling & UI
- **Tailwind CSS**: 4.2.4 - Utility-first CSS framework
- **Framer Motion**: 12.38.0 - Animation library for React
- **Lucide React**: 1.14.0 - Icon library (SVG icons)
- **clsx**: 2.1.1 - Utility for conditional className binding

### State Management & Data Fetching
- **React Query**: 5.100.6 - Server state management and caching
- **React Query DevTools**: 5.100.6 - Development debugging
- **React Context API**: Built-in for global state (Auth, Theme)

### Routing
- **React Router**: 7.14.2 - Client-side routing with nested routes

### Forms & Validation
- **React Hook Form**: 7.74.0 - Performant form state management
- **@hookform/resolvers**: 5.2.2 - Validation schema integration
- **Zod**: 4.4.1 - TypeScript-first schema validation

### HTTP Communication
- **Axios**: 1.15.2 - HTTP client with interceptors
- **OpenAI**: 6.35.0 - Official OpenAI API client

### Document Generation
- **docx**: 9.7.1 - Generate Word documents (.docx)
- **file-saver**: 2.0.5 - Save files to disk
- **@types/file-saver**: 2.0.7 - TypeScript types

### Document Processing
- **jsPDF**: 4.2.1 - PDF generation
- **html2canvas**: 1.4.1 - HTML to canvas conversion
- **bwip-js**: 4.11.2 - Barcode generation

### Development Tools
- **ESLint**: 10.2.1 - Code linting
- **@eslint/js**: 10.0.1 - ESLint JavaScript rules
- **typescript-eslint**: 8.58.2 - TypeScript ESLint support
- **eslint-plugin-react-hooks**: 7.1.1 - React hooks linting
- **eslint-plugin-react-refresh**: 0.5.2 - React refresh linting
- **@vitejs/plugin-react**: 6.0.1 - Vite React plugin
- **@tailwindcss/vite**: 4.2.4 - Tailwind CSS Vite plugin
- **globals**: 17.5.0 - Global variable definitions

### Type Definitions
- **@types/react**: 19.2.14
- **@types/react-dom**: 19.2.3
- **@types/node**: 24.12.2

## Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Build Configuration

### Vite Config (`vite.config.ts`)
- React plugin for JSX transformation
- Tailwind CSS plugin for styling
- API proxy configuration:
  - `/api/*` → Backend API
  - `/v1/*` → Backend API
  - `/k1/*` → Backend API
- Environment variable exposure: `KEALEX_API_BASE_URL`
- SPA mode enabled

### TypeScript Config
- **tsconfig.json**: Root configuration with project references
- **tsconfig.app.json**: Application-specific settings
- **tsconfig.node.json**: Node/build tool settings
- Target: ES2020
- Module: ESNext
- JSX: React-JSX

### ESLint Config (`eslint.config.js`)
- JavaScript rules from @eslint/js
- TypeScript rules from typescript-eslint
- React hooks rules
- React refresh rules

## Environment Variables

### Required
- `KEALEX_API_BASE_URL`: Backend API base URL (e.g., http://localhost:8000)

### Optional
- `KEALEX_OPENAI_API_KEY`: OpenAI API key for AI features

## API Integration

### Axios Client Configuration
- Base URL: `KEALEX_API_BASE_URL`
- Interceptors:
  - Request: Inject JWT token from localStorage
  - Response: Handle 401 errors (redirect to login)
- Timeout: Configurable per request
- Error handling: Centralized error transformation

### API Endpoints Structure
```
/api/
├── auth/              # Authentication
├── usuarios/          # User management
├── processos/         # Case management
├── documentos/        # Document management
├── prazos/            # Deadline management
├── cobrancas/         # Collection management
├── financeiro/        # Financial data
├── clientes/          # Client management
├── escritorios/       # Law firm management
├── configuracoes/     # System configuration
├── agentes/           # Agent management
├── assinatura/        # Subscription management
└── ai/                # AI/Chat endpoints
```

## Performance Optimizations

### React Query Configuration
- `staleTime`: 30 seconds (data freshness)
- `retry`: 1 (failed request retry)
- Automatic cache invalidation on mutations
- Background refetching

### Code Splitting
- Route-based code splitting via React Router
- Dynamic imports for heavy components
- Lazy loading of pages

### Bundle Analysis
- Current size: ~1,209 kB (346 kB gzip)
- Modules: 2,496 transformed
- Build time: ~3.66 seconds

### Rendering Optimization
- React 19 concurrent features
- Memoization of expensive components
- useCallback for event handlers
- useMemo for computed values

## Authentication & Security

### JWT Authentication
- Token stored in localStorage
- Injected in Authorization header
- Automatic token refresh on 401
- Logout on token expiration

### Role-Based Access Control
- Roles: admin, advogado (lawyer), cliente (client)
- Route protection via ProtectedLayout
- Component-level visibility based on role
- Sidebar menu items filtered by role

### CORS & Proxy
- Development: Vite proxy handles CORS
- Production: Backend CORS headers
- Secure flag on cookies
- HttpOnly flag for sensitive cookies

## Browser Support

- Modern browsers (ES2020 target)
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Build Output
- Static SPA in `dist/` directory
- Can be served by any static file server
- Requires backend API running separately

### Hosting Options
- Vercel, Netlify (recommended for SPA)
- AWS S3 + CloudFront
- Traditional web servers (Apache, Nginx)

### Environment Setup
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Configure backend API URL
4. Set up environment variables
5. Enable CORS on backend

## Development Workflow

### Local Development
1. Clone repository
2. `npm install`
3. Copy `.env.example` to `.env`
4. Configure `KEALEX_API_BASE_URL`
5. `npm run dev`
6. Access http://localhost:5173

### Code Quality
- ESLint for code style
- TypeScript for type safety
- React DevTools for debugging
- React Query DevTools for cache inspection

### Testing
- Test files: `test-*.js` in root
- Manual testing via browser
- API endpoint testing scripts included

## Dependencies Summary

### Production (17 packages)
- React ecosystem: react, react-dom, react-router-dom, react-hook-form
- State: @tanstack/react-query
- Styling: tailwindcss, framer-motion, lucide-react
- HTTP: axios, openai
- Forms: @hookform/resolvers, zod
- Documents: docx, file-saver, jspdf, html2canvas, bwip-js
- Utilities: clsx

### Development (13 packages)
- Build: vite, @vitejs/plugin-react, @tailwindcss/vite
- Linting: eslint, typescript-eslint, eslint-plugin-react-*
- Types: @types/react, @types/react-dom, @types/node
- Utilities: globals, typescript
