import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/jobs': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/job': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/metrics': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/executions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})