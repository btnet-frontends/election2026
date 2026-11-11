// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.businesstoday.com.tw',
  // npm run dev overrides this with --base / for local development.
  base: '/bt_topic/2026/election/',
  vite: {
    server: {
      proxy: {
        '/files/2026election/uat/': {
          target: 'https://download.businesstoday.com.tw',
          changeOrigin: true
        },
        '/api/referendum': {
          target: 'https://download.businesstoday.com.tw',
          changeOrigin: true,
          rewrite: () => '/files/2026election/uat/getReferendum'
        },
        '/api/invoicing-result': {
          target: 'https://download.businesstoday.com.tw',
          changeOrigin: true,
          rewrite: (path) => path.replace('/api/invoicing-result', '/files/2026election/uat/getInvoicingResult')
        }
      }
    }
  },
  integrations: [vue()]
});
