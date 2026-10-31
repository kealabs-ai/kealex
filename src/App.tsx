import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/Toast'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedLayout } from './components/ProtectedLayout'
import { LoginPage } from './pages/LoginPage'
import { LandingPage } from './pages/site/LandingPage'
import { LGPDPage } from './pages/site/LGPDPage'
import { TermosPage } from './pages/site/TermosPage'
import { ProcessosPage } from './pages/ProcessosPage'
import { DocumentosPage } from './pages/DocumentosPage'
import { PrazosPage } from './pages/PrazosPage'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { FinanceiroPage } from './pages/FinanceiroPage'
import { CobrancaPage } from './pages/CobrancaPage'
import { UsuariosPage } from './pages/UsuariosPage'
import { ClientesPage } from './pages/ClientesPage'
import { IAPage } from './pages/IAPage'
import { MinhaIAPage } from './pages/MinhaIAPage'
import { MeusAgentsPage } from './pages/MeusAgentsPage'
import { AnaliseDocumentosPage } from './pages/AnaliseDocumentosPage'
import { AdminPage } from './pages/AdminPage'
import { IntimacoesPage } from './pages/IntimacoesPage'
import { AudienciasPage } from './pages/AudienciasPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ErrorPage } from './pages/ErrorPage'
import { TrialExpiradoPage } from './pages/TrialExpiradoPage'
import { PagamentoPendentePage } from './pages/PagamentoPendentePage'
import { EquipeEscritorioPage } from './pages/EquipeEscritorioPage'
import { PerfilPage } from './pages/PerfilPage'
import { IntegracaoOrgaosPage } from './pages/IntegracaoOrgaosPage'
import { ConsultaJusticaEleitoralPage, ConsultaJusticaEstadualPage, ConsultaJusticaFederalPage, ConsultaJusticaMilitarPage, ConsultaJusticaTrabalhoPage, ConsultaTribunaisSuperioresPage } from './pages/ConsultaTribunaisSuperioresPage'
import { AssinaturaPage } from './pages/site/AssinaturaPage'
import { CookieConsent } from './components/CookieConsent'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30, retry: 1 } },
})

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/lgpd" element={<LGPDPage />} />
                <Route path="/privacidade" element={<LGPDPage />} />
                <Route path="/termos" element={<TermosPage />} />
                <Route path="/termos-de-uso" element={<TermosPage />} />
                <Route path="/entrar" element={<LoginPage />} />
                <Route path="/login" element={<Navigate to="/entrar" replace />} />
                <Route path="/trial-expirado" element={<TrialExpiradoPage />} />
                <Route path="/pagamento-pendente" element={<PagamentoPendentePage />} />
                <Route path="/assinar" element={<AssinaturaPage />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route element={<ProtectedLayout />}>
                  <Route path="/app" element={<Navigate to="/processos" replace />} />
                  <Route path="/processos" element={<ProcessosPage />} />
                  <Route path="/documentos" element={<DocumentosPage />} />
                  <Route path="/prazos" element={<PrazosPage />} />
                  <Route path="/atividades" element={<ActivitiesPage />} />
                  <Route path="/financeiro" element={<FinanceiroPage />} />
                  <Route path="/cobranca" element={<CobrancaPage />} />
                  <Route path="/usuarios" element={<UsuariosPage />} />
                  <Route path="/equipe" element={<EquipeEscritorioPage />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/ia" element={<IAPage />} />
                  <Route path="/configuracoes/ia" element={<MinhaIAPage />} />
                  <Route path="/meus-agents" element={<MeusAgentsPage />} />
                  <Route path="/analise-documentos" element={<AnaliseDocumentosPage />} />
                  <Route path="/intimacoes" element={<IntimacoesPage />} />
                  <Route path="/audiencias" element={<AudienciasPage />} />
                  <Route path="/perfil" element={<PerfilPage />} />
                  <Route path="/integracao-orgaos" element={<IntegracaoOrgaosPage />} />
                  <Route path="/integracao-orgaos/tribunais-superiores" element={<ConsultaTribunaisSuperioresPage />} />
                  <Route path="/integracao-orgaos/justica-estadual" element={<ConsultaJusticaEstadualPage />} />
                  <Route path="/integracao-orgaos/justica-federal" element={<ConsultaJusticaFederalPage />} />
                  <Route path="/integracao-orgaos/justica-trabalho" element={<ConsultaJusticaTrabalhoPage />} />
                  <Route path="/integracao-orgaos/justica-eleitoral" element={<ConsultaJusticaEleitoralPage />} />
                  <Route path="/integracao-orgaos/justica-militar" element={<ConsultaJusticaMilitarPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <CookieConsent />
            </BrowserRouter>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
