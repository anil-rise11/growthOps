import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // apiClient uses /proxy-core in dev — strip the prefix, forward to root of backend
      '/proxy-core': {
        target: 'https://api-test.zetaleap.ai',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy-core/, ''),
      },
      // v1ApiClient uses /api in dev — forward as-is
      '/api': {
        target: 'https://api-test.zetaleap.ai',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

