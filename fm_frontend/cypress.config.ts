import { defineConfig } from 'cypress'
import { readFileSync } from 'node:fs'

function readDeploymentEnv(): Record<string, string> {
  try {
    const content = readFileSync(new URL('../deployment/.env', import.meta.url), 'utf-8')
    return Object.fromEntries(
      content
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#') && line.includes('='))
        .map(line => {
          const eq = line.indexOf('=')
          const key = line.slice(0, eq).trim()
          const val = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
          return [key, val]
        })
    )
  } catch {
    return {}
  }
}

function readCypressEnv(): Record<string, unknown> {
  try {
    const content = readFileSync(new URL('./cypress.env.json', import.meta.url), 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

const deployEnv = readDeploymentEnv()
const cypressEnv = readCypressEnv()

const port = (cypressEnv.port as number) ?? 5173
const basePath = process.env.VITE_BASE_PATH ?? deployEnv.VITE_BASE_PATH ?? ''

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:${port}${basePath}`,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 800,
    env: {
      apiBase: `${basePath}/api`,
    },
  },
})
