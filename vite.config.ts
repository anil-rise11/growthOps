import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // apiClient → /proxy-core → strips prefix, forwards to backend root (/sales-marketing-ops/...)
      '/proxy-core': {
        target: 'https://growthops.rise11.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy-core/, ''),
      },
      // v1ApiClient → /api/v1/sales-marketing-ops/...
      '/api/v1': {
        target: 'https://growthops.rise11.com',
        changeOrigin: true,
        secure: true,
      },
      // metaAdsService (Section 13) → /api/sales-marketing-ops/meta/manual/...
      // Must be listed BEFORE /api/v1 since Vite matches in order
      '/api/sales-marketing-ops': {
        target: 'https://growthops.rise11.com',
        changeOrigin: true,
        secure: true,
      },
      // v2ApiClient (performance, revenue, autonomous) → /v2/sales-marketing-ops/...
      '/v2': {
        target: 'https://growthops.rise11.com',
        changeOrigin: true,
        secure: true,
      },
      // webhooksService → /webhooks/...
      '/webhooks': {
        target: 'https://growthops.rise11.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
