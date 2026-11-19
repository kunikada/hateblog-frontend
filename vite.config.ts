import path from 'node:path'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), TanStackRouterVite(), tailwindcss()],
    build: {
      rolldownOptions: {
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          notFound: path.resolve(import.meta.dirname, '404.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api/v1': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
