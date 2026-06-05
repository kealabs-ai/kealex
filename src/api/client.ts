import axios from 'axios'

// Usar proxy local para evitar CORS em desenvolvimento
const isDev = import.meta.env.DEV
const baseURL = isDev 
  ? '/api'  // Proxy local do Vite
  : (import.meta.env.VITE_API_URL || 'https://srv1023256.hstgr.cloud/k1/lex')

export const api = axios.create({ baseURL })

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
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)
