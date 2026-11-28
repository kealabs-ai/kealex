import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.KEALEX_API_BASE_URL
  if (!apiBaseUrl) throw new Error('KEALEX_API_BASE_URL precisa estar configurada no .env do frontend')
  const apiOrigin = /^https?:\/\//i.test(apiBaseUrl) ? new URL(apiBaseUrl).origin : null
  const maxUploadBytes = Number(env.KEALEX_MAX_UPLOAD_BYTES || 104857600)
  if (!Number.isSafeInteger(maxUploadBytes) || maxUploadBytes <= 0) {
    throw new Error('KEALEX_MAX_UPLOAD_BYTES precisa ser um inteiro positivo')
  }
  const developmentCsp = {
    name: 'kealex-csp-policy',
    transformIndexHtml(html: string) {
      const apiSource = apiOrigin ? ` ${apiOrigin}` : ''
      const devSocketSource = mode === 'development' ? ' ws://localhost:5173' : ''
      const withApiOrigin = html.replace(
        "connect-src 'self'",
        `connect-src 'self'${apiSource}${devSocketSource}`,
      )
      if (mode !== 'production') {
        return withApiOrigin.replace("script-src 'self';", "script-src 'self' 'unsafe-inline';")
      }
      return withApiOrigin
    },
  }

  return {
  // O cliente Axios precisa da URL no bundle de produção. KEALEX_API_BASE_URL
  // é carregada pelo Vite, mas não é exposta ao navegador sem esta definição.
  define: {
    'import.meta.env.KEALEX_API_BASE_URL': JSON.stringify(apiBaseUrl),
    'import.meta.env.KEALEX_MAX_UPLOAD_BYTES': JSON.stringify(maxUploadBytes),
  },
  plugins: [react(), tailwindcss(), developmentCsp],
  appType: 'spa',
  server: {
    proxy: {
      '/k1': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false,
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
