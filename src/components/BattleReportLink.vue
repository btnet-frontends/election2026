<template>
  <section v-if="phase !== 'default' || showBeforeCounting" class="battle-report-section" aria-label="頁尾導覽">
    <nav class="container page-links" aria-label="選舉專題頁面">
      <a v-for="item in pageLinks" :key="item.id" :href="item.href" class="battle-report-button">
        {{ item.label }}
        <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </nav>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import config from '../json/data.json';
import { usePhase } from '../composables/usePhase.js';

defineProps({ showBeforeCounting: { type: Boolean, default: false } });

const { phase, navNo } = usePhase();
const localBaseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

const pageLinks = computed(() => {
  const navItems = config.header.find((entry) => entry.navNo === navNo.value)?.navItems ?? [];
  const items = phase.value === 'default'
    ? navItems.filter((item) => item.children?.some((child) => child.id === 'tags'))
    : navItems;
  return items.map((item) => ({
    id: item.id,
    label: item.label.replace(/\s*▼$/, ''),
    href: `${localBaseUrl}/${item.href.replace(/^\/+/, '')}`
  }));
});
</script>

<style scoped>
.battle-report-section {
  padding: 4rem 0 5rem;
  background: var(--color-coffee-50);
  text-align: center;
}

.battle-report-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 56px;
  padding: 0.9rem 2.5rem;
  border-radius: 999px;
  background: var(--color-primary);
  color: var(--color-coffee-0);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.page-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
}

.battle-report-button:hover {
  background: var(--color-coffee-900);
}

.battle-report-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 5px;
}

@media (max-width: 768px) {
  .battle-report-section {
    padding: 3rem 0 4rem;
  }

  .page-links {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .battle-report-button {
    width: 100%;
    max-width: 320px;
  }
}
</style>
