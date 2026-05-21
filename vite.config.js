import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const gatewayTarget = env.VITE_API_GATEWAY_BASE || env.VITE_GATEWAY_URL;
  const defaultGatewayTarget = gatewayTarget || 'http://18.210.98.9:8080';
  const authTarget = defaultGatewayTarget;
  const catalogTarget = gatewayTarget || env.VITE_CATALOG_SERVICE_URL || 'http://18.210.98.9:8080';
  const notificationTarget =
    gatewayTarget ||
    env.VITE_ORDER_NOTIFICATION_SERVICE_URL ||
    env.VITE_NOTIFICATION_SERVICE_URL ||
    'http://18.210.98.9:8080';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/auctions': {
          target: defaultGatewayTarget,
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
          target: defaultGatewayTarget,
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
