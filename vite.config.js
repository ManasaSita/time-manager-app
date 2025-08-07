import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/time-manager-app/', // Replace with your repo name
  build: {
    outDir: 'dist',
  },
})
