import { defineConfig } from 'vite';

export default defineConfig({
  root: 'native-src',
  base: './',
  build: {
    outDir: '../www',
    emptyOutDir: true,
    target: 'es2022',
    minify: true
  }
});
