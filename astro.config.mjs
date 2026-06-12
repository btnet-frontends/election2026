// @ts-check
import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  site: 'https://webtest-miball.businesstoday.com.tw',
  base: '/bt_topic/2026/election/',
  integrations: [vue()]
});