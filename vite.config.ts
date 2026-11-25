import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ command }) => ({
  plugins: [
    // Only use HTTPS in dev mode (not during build for GitHub Actions)
    // Disable HTTPS if TEST_MODE env var is set
    command === 'serve' && !process.env.TEST_MODE ? basicSsl() : undefined
  ].filter(Boolean),
  server: {
    port: process.env.TEST_MODE ? 3001 : 3000
  },
  base: '/balancly/'
}))
