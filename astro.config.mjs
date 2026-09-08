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
        '/api/invoicing-result': {
          target: 'https://doqvf81n9htmm.cloudfront.net',
          changeOrigin: true,
          rewrite: () => '/files/2026election/getInvoicingResult'
        }
      }
    }
  },
  integrations: [vue()]
});
