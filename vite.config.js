import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/blood-donor-app/',
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    headers: {
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: ws: wss: data: blob:;"
    }
  },
  build: {
    outDir: 'dist'
  }
})