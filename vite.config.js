import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src/pages',
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/pages/index.html'),
        user: resolve(__dirname, 'src/pages/user.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: '/index.html',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/ts'),
    },
  },
});
