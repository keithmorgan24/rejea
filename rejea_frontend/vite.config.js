import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite' // This is the v4 way
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
