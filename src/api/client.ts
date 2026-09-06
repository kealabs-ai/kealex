import axios from 'axios'

// Em dev usa proxy do Vite, em prod usa proxy reverso do Apache (.htaccess)
const baseURL = import.meta.env.DEV ? '/api' : ''

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
    // Apenas redirecionar para login em caso de 401 (não autorizado)
    // Não redirecionar em 404 ou outros erros
    if (err.response?.status === 401) {
      const msg = err.response?.data?.message ?? ''
      const isExpired = msg === 'Unauthorized' || msg === '' || msg.toLowerCase().includes('token')
      if (isExpired) {
        localStorage.removeItem('kealex_token')
        localStorage.removeItem('kealex_user')
        // Apenas redirecionar se não estiver na página de login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)
