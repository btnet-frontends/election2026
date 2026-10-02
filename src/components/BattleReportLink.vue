<template>
  <section class="battle-report-section" aria-label="即時戰報">
    <div class="container">
      <a :href="battleReportHref" class="battle-report-button">
        即時戰報
        <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import config from '../json/data.json';
import { usePhase } from '../composables/usePhase.js';

const { navNo } = usePhase();
const localBaseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

const battleReportHref = computed(() => {
  // 即時戰報在開票前位於首頁，開票中與結束後移至 page3；沿用導覽設定。
  const navItems = config.header.find((entry) => entry.navNo === navNo.value)?.navItems ?? [];
  const href = navItems.find((item) => item.children?.some((child) => child.id === 'tags'))?.href ?? '#kv';
  return `${localBaseUrl}/${href.replace(/^\/+/, '')}`;
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

  .battle-report-button {
    width: 100%;
    max-width: 320px;
  }
}
</style>
