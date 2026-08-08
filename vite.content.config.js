import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Контент-скрипт собирается отдельно: ему нужен IIFE без import'ов и без очистки dist/.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    target: 'chrome120',
    lib: {
      entry: resolve(import.meta.dirname, 'src/content.js'),
      name: 'SvgDownloadrContent',
      formats: ['iife'],
      fileName: () => 'content.js'
    }
  }
});
