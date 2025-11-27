import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist'
  },
  // React Router future flags যোগ করুন
  define: {
    'process.env': {
      VITE_REACT_ROUTER_V7_START_TRANSITION: 'true',
      VITE_REACT_ROUTER_V7_RELATIVE_SPLAT_PATH: 'true'
    }
  }
})