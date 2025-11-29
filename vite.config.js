import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3001,
    host: '0.0.0.0',
    open: true // Automatically open browser
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Production-এ sourcemap বন্ধ রাখুন
    minify: 'esbuild' // Faster minification
  },
  resolve: {
    alias: {
      // যদি custom aliases দরকার হয়
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'] // Pre-bundle dependencies
  }
})