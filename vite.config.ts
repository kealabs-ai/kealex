import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.KEALEX_API_BASE_URL
  if (!apiBaseUrl) throw new Error('KEALEX_API_BASE_URL precisa estar configurada no .env do frontend')

  return {
  plugins: [react(), tailwindcss()],
  appType: 'spa',
  server: {
    proxy: {
      '/k1': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
          console.log('[Proxy]', req.method, req.url, '->', apiBaseUrl + proxyReq.path)
          })
        },
      },
      '/v1': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: apiBaseUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
  }
})
