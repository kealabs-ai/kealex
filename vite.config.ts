import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: 'spa',
  server: {
    proxy: {
      '/k1': {
        target: 'https://srv1023256.hstgr.cloud',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('[Proxy]', req.method, req.url, '->', 'https://srv1023256.hstgr.cloud' + proxyReq.path)
          })
        },
      },
      '/api': {
        target: 'https://srv1023256.hstgr.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
})
