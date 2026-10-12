# Kealex - Development Guidelines & Patterns

## Code Quality Standards

### TypeScript Usage
- **Strict typing**: All functions and variables must have explicit type annotations
- **Type definitions**: Centralized in `src/types/index.ts` with clear naming conventions
- **Union types**: Used for status fields (e.g., `StatusProcesso = 'ativo' | 'arquivado' | 'encerrado'`)
- **Interface inheritance**: Use `extends BaseEntity` for all domain entities with `id`, `createdAt`, `updatedAt`
- **No `any` types**: Avoid `any` except in rare cases with comments explaining why

### Naming Conventions
- **Files**: PascalCase for components (e.g., `AdminPage.tsx`), camelCase for utilities (e.g., `guiaGenerator.ts`)
- **Types**: PascalCase for interfaces and types (e.g., `Usuario`, `Processo`)
- **Status types**: Suffix with `Status` (e.g., `StatusProcesso`, `StatusDocumento`)
- **API clients**: Suffix with `Api` (e.g., `agentesApi`, `configuracoesApi`)
- **Hooks**: Prefix with `use` (e.g., `useProcessos`, `useCobrancaFluxo`)
- **Constants**: UPPER_SNAKE_CASE for configuration values

### Code Formatting
- **Indentation**: 2 spaces (configured in ESLint)
- **Line length**: Keep under 100 characters when practical
- **Imports**: Group by external, internal, types (in that order)
- **Exports**: Use named exports for components and utilities, default export for pages
- **Comments**: Minimal inline comments; code should be self-documenting
- **Semicolons**: Always use semicolons (enforced by ESLint)

## Structural Conventions

### Component Organization
- **Functional components**: Always use React hooks, no class components
- **Component structure**:
  ```typescript
  // 1. Imports
  // 2. Type definitions (local to component)
  // 3. Component function
  // 4. Sub-components (if any)
  // 5. Export
  ```

### Page Components
- Located in `src/pages/`
- Wrap with `Topbar` component for consistent header
- Use `motion.div` from Framer Motion for page transitions
- Handle loading and error states with skeleton loaders
- Implement search/filter functionality with state management

### Reusable Components
- Located in `src/components/`
- Accept props for customization
- Use Tailwind CSS for styling
- Include proper TypeScript prop interfaces
- Support light/dark theme with `dark:` prefix classes

### API Client Pattern
- Each domain has dedicated module in `src/api/`
- Use Axios instance with interceptors
- Consistent error handling with try-catch
- Return typed responses matching `src/types/`
- Example structure:
  ```typescript
  export const agentesApi = {
    list: () => client.get('/agentes'),
    get: (id: string) => client.get(`/agentes/${id}`),
    create: (data) => client.post('/agentes', data),
    update: (id: string, data) => client.put(`/agentes/${id}`, data),
    delete: (id: string) => client.delete(`/agentes/${id}`)
  }
  ```

### React Query Hooks
- Located in `src/hooks/`
- Encapsulate query/mutation logic
- Use `useQuery` for data fetching with caching
- Use `useMutation` for create/update/delete operations
- Implement cache invalidation on mutations
- Example pattern:
  ```typescript
  export function useProcessos() {
    return useQuery({
      queryKey: ['processos'],
      queryFn: () => processosApi.list(),
      staleTime: 1000 * 30
    })
  }
  ```

## Semantic Patterns

### State Management
- **Global state**: AuthContext (user, token, role), ThemeContext (light/dark)
- **Server state**: React Query for API data with automatic caching
- **Local state**: Component `useState` for UI-only state
- **Avoid prop drilling**: Use Context API for deeply nested components

### Data Flow
1. Page component renders
2. Custom hook fetches data via React Query
3. API client calls backend
4. Response cached by React Query
5. Component re-renders with data
6. User interaction triggers mutation
7. Mutation invalidates cache
8. Query refetches automatically

### Error Handling
- Wrap API calls in try-catch blocks
- Display user-friendly error messages via Toast component
- Log errors to console in development
- Redirect to `/error` page for critical failures
- Show error boundaries for component crashes

### Loading States
- Use skeleton loaders for tables (SkeletonRow component)
- Show spinner for async operations
- Disable buttons during loading with `loading` prop
- Display "No data" empty states with icons

### Animation Patterns
- Use Framer Motion for page transitions
- Animate list items with staggered delays
- Use `AnimatePresence` for exit animations
- Keep animations under 300ms for responsiveness
- Example:
  ```typescript
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
  ```

### Form Handling
- Use React Hook Form for form state
- Integrate Zod for schema validation
- Implement field-level validation
- Show inline error messages
- Disable submit button during submission
- Reset form after successful submission

### Theme Support
- All components support light/dark mode
- Use Tailwind `dark:` prefix for dark mode styles
- Background: `bg-white dark:bg-slate-950`
- Text: `text-gray-900 dark:text-white`
- Borders: `border-gray-200 dark:border-slate-700`
- Hover states: `hover:bg-gray-100 dark:hover:bg-slate-800`

## Frequently Used Code Idioms

### Conditional Rendering
```typescript
// Use ternary for simple conditions
{isLoading ? <Spinner /> : <Content />}

// Use && for single condition
{isAdmin && <AdminPanel />}

// Use AnimatePresence for list animations
<AnimatePresence>
  {items.map((item) => (
    <motion.div key={item.id} ...>
      {item.name}
    </motion.div>
  ))}
</AnimatePresence>
```

### Array Filtering & Mapping
```typescript
// Filter with includes for search
const filtered = items.filter(item =>
  item.name.toLowerCase().includes(search.toLowerCase())
)

// Map with index for animations
items.map((item, i) => (
  <motion.div key={item.id} transition={{ delay: i * 0.03 }}>
    {item.name}
  </motion.div>
))
```

### Status Mapping
```typescript
// Use Record type for status-to-value mappings
const roleColors: Record<Role, string> = {
  admin: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
  advogado: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
  cliente: 'linear-gradient(135deg,#10b981,#059669)',
}

// Use in rendering
<div style={{ background: roleColors[user.role] }}>
```

### Toggle State Pattern
```typescript
// Simple toggle
<button onClick={() => setConfig({ ...config, ssl_enabled: !config.ssl_enabled })}>
  Toggle
</button>

// With conditional styling
className={config.ssl_enabled ? 'bg-emerald-500' : 'bg-gray-300'}
```

### Modal/Dialog Pattern
```typescript
// State management
const [state, setState] = useState<ModalState>({
  editing: null,
  viewing: null,
  confirmDelete: null,
  open: false
})

// Conditional rendering
{state.open && (
  <Modal title="..." onClose={() => setState(s => ({ ...s, open: false }))}>
    {/* Modal content */}
  </Modal>
)}
```

### API Response Handling
```typescript
// Async function with error handling
const handleSave = async () => {
  try {
    await saveConfig.mutateAsync(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Gradient Styling
```typescript
// Inline gradient styles for cards
style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}

// Or use Tailwind gradient classes
className="bg-gradient-to-r from-indigo-500 to-purple-600"
```

## Popular Annotations & Decorators

### TypeScript Decorators
- Not used in this codebase (functional approach preferred)
- Use type annotations instead: `const value: string = 'text'`

### JSDoc Comments
- Used sparingly for complex functions
- Example:
  ```typescript
  /**
   * Generates a barcode number for payment guide
   * @param valor - Amount in BRL
   * @param vencimento - Due date string
   * @returns Formatted barcode string
   */
  const gerarCodigoBarras = (valor: number, vencimento: string): string => {
    // Implementation
  }
  ```

### React Annotations
- Use `type` keyword for component props
- Example:
  ```typescript
  type AdminPageProps = {
    title: string
    onSave: (data: any) => void
  }
  ```

## Internal API Usage Patterns

### Axios Client Configuration
```typescript
// Interceptor for JWT injection
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Error handling
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    throw error
  }
)
```

### React Query Configuration
```typescript
// Global defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,  // 30 seconds
      retry: 1,               // Retry once on failure
      gcTime: 1000 * 60 * 5   // 5 minutes cache
    }
  }
})

// Cache invalidation after mutation
mutation.mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] })
  }
})
```

### Context API Pattern
```typescript
// Create context with default value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for consumption
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

## Best Practices Summary

### Performance
- Memoize expensive components with `React.memo`
- Use `useCallback` for event handlers passed to children
- Implement code splitting with React Router lazy loading
- Optimize images and assets
- Monitor bundle size (current: 346 kB gzip)

### Security
- Never store sensitive data in localStorage (except JWT)
- Validate all user inputs on frontend and backend
- Use HTTPS in production
- Implement CORS properly
- Sanitize HTML content before rendering

### Accessibility
- Use semantic HTML elements
- Include `title` attributes on interactive elements
- Maintain color contrast ratios (WCAG AA)
- Support keyboard navigation
- Use ARIA labels where needed

### Testing
- Write unit tests for utilities
- Test API integration with mock data
- Manual E2E testing for critical flows
- Test light/dark theme switching
- Validate responsive design on mobile

### Documentation
- Keep README.md updated
- Document complex functions with JSDoc
- Add comments for non-obvious logic
- Maintain type definitions in `src/types/index.ts`
- Update knowledge base files when adding features

### Git Workflow
- Use descriptive commit messages
- Create feature branches from main
- Squash commits before merging
- Keep commits atomic and focused
- Reference issues in commit messages
