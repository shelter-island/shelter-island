import { resolve } from 'node:path';

export default {
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        crewDetail: resolve(__dirname, 'crew-detail.html'),
        grow: resolve(__dirname, 'grow.html'),
        sunChat: resolve(__dirname, 'sun-chat.html'),
      },
    },
  },
};
