import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ Important for GitHub Pages / Vercel subfolders
  build: {
    outDir: 'dist',
  }
})
