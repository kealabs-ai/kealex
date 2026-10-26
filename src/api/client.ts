import axios from 'axios'

const baseURL = import.meta.env.KEALEX_API_BASE_URL

export const api = axios.create({ 
  baseURL,
  timeout: 30000 // 30 segundos
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kealex_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      const msg = err.response?.data?.message ?? ''
      const isExpired = msg === 'Unauthorized' || msg === '' || msg.toLowerCase().includes('token')
      if (isExpired) {
        localStorage.removeItem('kealex_token')
        localStorage.removeItem('kealex_user')
        if (window.location.pathname !== '/entrar') {
          window.location.href = '/entrar'
        }
      }
    }

    if (err.response?.status === 403) {
      const detail = err.response?.data?.detail ?? ''
      const reason = String(detail).toLowerCase()
      // Redireciona para /processos e deixa o ProtectedLayout exibir o modal de pagamento
      if (/(trial|assinatura|conta inativa)/.test(reason) && window.location.pathname !== '/processos') {
        window.location.href = '/processos'
      }
    }

    return Promise.reject(err)
  }
)
