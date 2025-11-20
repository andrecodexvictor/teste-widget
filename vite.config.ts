import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for Electron to find files relative to the HTML
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});