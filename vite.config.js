import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/auctions': {
          target: env.VITE_AUCTION_SERVICE_URL || 'http://localhost:8082',
          changeOrigin: true,
        },
        '/api/auth': {
          target: env.VITE_AUTH_SERVICE_URL || 'http://localhost:8081',
          changeOrigin: true,
        },
        '/api/profile': {
          target: env.VITE_AUTH_SERVICE_URL || 'http://localhost:8081',
          changeOrigin: true,
        },
        '/api/admin': {
          target: env.VITE_AUTH_SERVICE_URL || 'http://localhost:8081',
          changeOrigin: true,
        },
        '/listings': {
          target: env.VITE_CATALOG_SERVICE_URL || 'http://localhost:8083',
          changeOrigin: true,
        },
        '/api/categories': {
          target: env.VITE_CATALOG_SERVICE_URL || 'http://localhost:8083',
          changeOrigin: true,
        },
      },
    },
  };
})
