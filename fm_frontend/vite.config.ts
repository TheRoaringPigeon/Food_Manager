import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const fmApiUrl = env.VITE_API_URL || 'http://localhost:5001'
  const llmApiUrl = env.VITE_LLM_API_URL || 'http://localhost:5002'
  const basePath = env.VITE_BASE_PATH || '/'
  const base = basePath.endsWith('/') ? basePath : `${basePath}/`

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Food Manager',
          short_name: 'Food Mgr',
          description: 'Manage your family recipes and ingredients',
          theme_color: '#4f46e5',
          background_color: '#eef2ff',
          display: 'standalone',
          scope: base,
          start_url: base,
          icons: [
            {
              src: 'pwa-icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        // Disabled in dev — service workers interfere with HMR.
        // To test PWA locally: npm run build && npm run preview
        devOptions: {
          enabled: false,
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: 'index.html',
          // Don't intercept API calls with the service worker
          navigateFallbackDenylist: [
            /^\/food-manager\/api\//,
            /^\/food-manager\/llm\//,
          ],
        },
      }),
    ],
    base: env.VITE_BASE_PATH || '/',
    server: {
      host: true,
      port: 5173,
      watch: {
        usePolling: true,
      },
      hmr: {
        clientPort: 5173,
      },
      proxy: {
        '/food-manager/llm': {
          target: llmApiUrl,
          changeOrigin: true,
        },
        '/food-manager/api': {
          target: fmApiUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
