import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const gatewayTarget = env.VITE_GATEWAY_URL;
  const authTarget = gatewayTarget || env.VITE_AUTH_SERVICE_URL || 'http://localhost:8080';
  const auctionTarget = gatewayTarget || env.VITE_AUCTION_SERVICE_URL || 'http://localhost:8080';
  const catalogTarget = gatewayTarget || env.VITE_CATALOG_SERVICE_URL || 'http://localhost:8080';
  const walletTarget = gatewayTarget || env.VITE_WALLET_SERVICE_URL || 'http://localhost:8080';
  const notificationTarget = gatewayTarget || env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:8080';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/auctions': {
          target: auctionTarget,
          changeOrigin: true,
        },
        '/api/auth': {
          target: authTarget,
          changeOrigin: true,
        },
        '/api/profile': {
          target: authTarget,
          changeOrigin: true,
        },
        '/api/admin': {
          target: authTarget,
          changeOrigin: true,
        },
        '/listings': {
          target: catalogTarget,
          changeOrigin: true,
        },
        '/api/categories': {
          target: catalogTarget,
          changeOrigin: true,
        },
        '/api/wallet': {
          target: walletTarget,
          changeOrigin: true,
        },
        '/api/order-notification': {
          target: notificationTarget,
          changeOrigin: true,
        },
        '/api/notifications': {
          target: notificationTarget,
          changeOrigin: true,
        },
      },
    },
  };
})
