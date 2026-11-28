import axios from 'axios'
import { clearStoredSession, readAccessToken } from '../utils/authSessionStorage'
import { readAuthRoutingText } from '../utils/authRoutingText'

const baseURL = import.meta.env.KEALEX_API_BASE_URL

export const api = axios.create({ 
  baseURL,
  timeout: 30000 // 30 segundos
})

api.interceptors.request.use((config) => {
  const token = readAccessToken()
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      const msg = readAuthRoutingText(err.response?.data, 'message').toLowerCase()
      const isExpired = msg === 'unauthorized' || msg === '' || msg.includes('token')
      if (isExpired) {
        clearStoredSession()
        if (window.location.pathname !== '/entrar') {
          window.location.href = '/entrar'
        }
      }
    }

    if (err.response?.status === 403) {
      const reason = readAuthRoutingText(err.response?.data, 'detail').toLowerCase()
      // Redireciona para /processos e deixa o ProtectedLayout exibir o modal de pagamento
      if (/(trial|assinatura|conta inativa)/.test(reason) && window.location.pathname !== '/processos') {
        window.location.href = '/processos'
      }
    }

    return Promise.reject(err)
  }
)
