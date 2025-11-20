
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Para Vercel (Web), usamos a raiz '/'. 
  // Se for buildar para Electron futuramente, altere para './'
  base: '/', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
