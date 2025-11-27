import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel deployment friendly config
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,       // লোকাল ডেভ সার্ভার port
    open: true        // npm run dev দিলে ব্রাউজার auto খুলবে
  },
  build: {
    outDir: 'dist',   // build output folder
    sourcemap: true   // debugging এর জন্য sourcemap
  },
  preview: {
    port: 4173,       // vite preview port
    strictPort: true  // port conflict হলে fail করবে
  }
})
