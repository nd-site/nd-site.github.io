import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    outDir: 'assets/beta-dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'beta/src/main.tsx'),
      },
      output: {
        entryFileNames: 'bundle.js',
        assetFileNames: 'style.[ext]',
      },
    },
  },
});
