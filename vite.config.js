// import { fileURLToPath, URL } from 'node:url';
const { resolve } = require('path');
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import copy from 'rollup-plugin-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // This is needed, or else Vite will try to find image paths (which it wont be able to find because this will be called on the web, not directly)
      // For example <img src="/images/logo.png"> will not work without the code below
      template: {
        transformAssetUrls: {
          includeAbsolute: false,
        },
      },
    }),
    copy({
      targets: [
        { src: './src/assets/images/**/*', dest: 'dist/images' }
      ],
      hook: 'writeBundle'
    })],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '/images': 'src/assets/images',
    },
  },
});
