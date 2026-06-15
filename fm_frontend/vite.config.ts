import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const fmApiUrl = env.VITE_API_URL || 'http://localhost:5001'
  const llmApiUrl = env.VITE_LLM_API_URL || 'http://localhost:5002'

  return {
    plugins: [react()],
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
