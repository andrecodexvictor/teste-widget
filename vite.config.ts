
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Para Vercel (Web), usamos a raiz '/'. 
  // Se for buildar para Electron futuramente, certifique-se de testar se './' é necessário,
  // mas '/' geralmente funciona melhor para PWA/Web.
  base: '/', 
  build: {
    // Mudamos de 'dist' para 'build' pois a Vercel espera 'build' por padrão
    outDir: 'build',
    emptyOutDir: true,
  }
});
