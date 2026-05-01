import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './context/AuthContext'
import { ProtectedLayout } from './components/ProtectedLayout'
import { LoginPage } from './pages/LoginPage'
import { ProcessosPage } from './pages/ProcessosPage'
import { DocumentosPage } from './pages/DocumentosPage'
import { PrazosPage } from './pages/PrazosPage'
import { FinanceiroPage } from './pages/FinanceiroPage'
import { UsuariosPage } from './pages/UsuariosPage'
import { IAPage } from './pages/IAPage'
import { AdminPage } from './pages/AdminPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30, retry: 1 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/processos" replace />} />
              <Route path="/processos" element={<ProcessosPage />} />
              <Route path="/documentos" element={<DocumentosPage />} />
              <Route path="/prazos" element={<PrazosPage />} />
              <Route path="/financeiro" element={<FinanceiroPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/ia" element={<IAPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
