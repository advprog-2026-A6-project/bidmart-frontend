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
          target: env.VITE_AUCTION_SERVICE_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  };
})
