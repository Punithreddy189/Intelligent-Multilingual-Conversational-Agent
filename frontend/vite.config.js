import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/chat': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/translate': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/tts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/upload-pdf': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/pdf-qa': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
