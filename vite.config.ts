import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    mkcert({
      savePath: './certs',
      force: false
    })
  ],
  server: {
    https: true,
    port: 3000
  },
  base: '/balancly/'
})
