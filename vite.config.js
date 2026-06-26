import { resolve } from 'node:path';

export default {
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        grow: resolve(__dirname, 'grow.html'),
      },
    },
  },
};
