import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedLayout } from './components/ProtectedLayout'
import { LoginPage } from './pages/LoginPage'
import { LandingPage } from './pages/site/LandingPage'
import { LGPDPage } from './pages/site/LGPDPage'
import { TermosPage } from './pages/site/TermosPage'
import { ProcessosPage } from './pages/ProcessosPage'
import { DocumentosPage } from './pages/DocumentosPage'
import { PrazosPage } from './pages/PrazosPage'
import { FinanceiroPage } from './pages/FinanceiroPage'
import { CobrancaPage } from './pages/CobrancaPage'
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
                <Route path="/" element={<LandingPage />} />
                <Route path="/lgpd" element={<LGPDPage />} />
                <Route path="/privacidade" element={<LGPDPage />} />
                <Route path="/termos" element={<TermosPage />} />
                <Route path="/termos-de-uso" element={<TermosPage />} />
                <Route path="/entrar" element={<LoginPage />} />
                <Route path="/login" element={<Navigate to="/entrar" replace />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route element={<ProtectedLayout />}>
                  <Route path="/app" element={<Navigate to="/processos" replace />} />
                  <Route path="/processos" element={<ProcessosPage />} />
                  <Route path="/documentos" element={<DocumentosPage />} />
                  <Route path="/prazos" element={<PrazosPage />} />
                  <Route path="/financeiro" element={<FinanceiroPage />} />
                  <Route path="/cobranca" element={<CobrancaPage />} />
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
