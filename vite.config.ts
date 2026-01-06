import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('apexcharts') || id.includes('react-apexcharts')) {
              return 'vendor-charts';
            }
            if (id.includes('@google/genai')) {
              return 'vendor-ai';
            }
            if (id.includes('@supabase') || id.includes('framer-motion')) {
              return 'vendor-core';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    port: 3000
  }
});