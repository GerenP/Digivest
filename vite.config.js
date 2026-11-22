import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8787' } },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // chart library dipisah agar ter-cache terpisah dari kode aplikasi
        manualChunks: id => (/node_modules\/(recharts|d3-[^/]+|victory-vendor|recharts-scale|react-smooth)\//.test(id) ? 'charts' : undefined),
      },
    },
  },
})
