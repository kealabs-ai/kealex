import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedLayout } from './components/ProtectedLayout'
import { LoginPage } from './pages/LoginPage'
import { ProcessosPage } from './pages/ProcessosPage'
import { DocumentosPage } from './pages/DocumentosPage'
import { PrazosPage } from './pages/PrazosPage'
import { FinanceiroPage } from './pages/FinanceiroPage'
import { UsuariosPage } from './pages/UsuariosPage'
import { ClientesPage } from './pages/ClientesPage'
import { IAPage } from './pages/IAPage'
import { AdminPage } from './pages/AdminPage'
import { IntimacoesPage } from './pages/IntimacoesPage'
import { AudienciasPage } from './pages/AudienciasPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ErrorPage } from './pages/ErrorPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30, retry: 1 } },
})

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<Navigate to="/processos" replace />} />
                  <Route path="/processos" element={<ProcessosPage />} />
                  <Route path="/documentos" element={<DocumentosPage />} />
                  <Route path="/prazos" element={<PrazosPage />} />
                  <Route path="/financeiro" element={<FinanceiroPage />} />
                  <Route path="/usuarios" element={<UsuariosPage />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/ia" element={<IAPage />} />
                  <Route path="/intimacoes" element={<IntimacoesPage />} />
                  <Route path="/audiencias" element={<AudienciasPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
