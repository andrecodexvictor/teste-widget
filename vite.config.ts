
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Mantemos '/' para compatibilidade correta com Vercel/Web
  base: '/', 
  build: {
    // Voltamos para 'dist' pois é o padrão nativo do Vite
    outDir: 'dist',
    emptyOutDir: true,
  }
});
