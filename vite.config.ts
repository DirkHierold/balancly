import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(({ mode }) => ({
  plugins: mode === 'development' ? [
    mkcert({
      savePath: './certs',
      force: false
    })
  ] : [],
  server: {
    https: mode === 'development',
    port: 3000
  },
  base: '/balancly/'
}))
