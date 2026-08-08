import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const PDFOBJECT_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js';

/*
 * jsPDF в ветке output('pdfobjectnewwindow') подставляет <script src> с CDN. Мы этот путь
 * не вызываем, но сама ссылка попадает в бандл, а для Chrome Web Store наличие внешнего
 * скрипта в пакете — это «удалённый код». Вырезаем строку, чтобы её там не было.
 */
const stripRemoteScriptUrl = () => ({
  name: 'strip-jspdf-cdn',
  transform(code, id) {
    if (!id.includes('jspdf') || !code.includes(PDFOBJECT_CDN)) return null;
    return { code: code.replaceAll(PDFOBJECT_CDN, ''), map: null };
  }
});

// Основной билд: popup на Vue. Всё складывается в dist/ вместе с содержимым public/.
export default defineConfig({
  plugins: [vue(), stripRemoteScriptUrl()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'chrome120',
    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, 'popup.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
