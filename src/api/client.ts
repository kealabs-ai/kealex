import axios from 'axios'

const baseURL = import.meta.env.DEV
  ? ''
  : 'https://srv1023256.hstgr.cloud'

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
      if (detail.toLowerCase().includes('trial')) {
        const token = localStorage.getItem('kealex_token')
        const storedUser = localStorage.getItem('kealex_user')

        if (token && storedUser) {
          window.dispatchEvent(new CustomEvent('kealex:trial-expired'))
        } else if (window.location.pathname !== '/entrar' && window.location.pathname !== '/trial-expirado') {
          window.location.href = '/trial-expirado'
        }
      }
    }

    return Promise.reject(err)
  }
)
