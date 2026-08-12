<template>
  <section id="partyHistory" class="partyHistory-section">
    <div class="container partyHistory-container">
      <div class="section-subtitle">
        <h2>• 歷史版圖 •</h2>
      </div>

      <div class="partyHistory_area">
        <div class="year-buttons" role="group" aria-label="選擇縣市長選舉年份">
          <button
            v-for="item in yearOptions"
            :key="item.year"
            type="button"
            class="year-button"
            :class="{ 'is-active': selectedYear === item.year }"
            :aria-pressed="selectedYear === item.year"
            aria-controls="party-history-map-panel"
            @click="selectedYear = item.year"
          >
            {{ item.year }}
          </button>
        </div>

        <div id="party-history-map-panel" class="history-map" role="region" :aria-label="mapLabel">
          <TaiwanPartyHistoryLocation
            :location-colors="locationColors"
            :location-descriptions="locationDescriptions"
            :map-label="mapLabel"
          />
        </div>

        <p v-if="selectedYearOption?.note" class="year-note" role="status">
          {{ selectedYearOption.note }}
        </p>

        <ul class="party-legend" :aria-label="`${selectedYear} 年政黨版圖圖例`">
          <li v-for="party in visibleParties" :key="party.key" class="legend-item">
            <span class="legend-color" :style="{ backgroundColor: party.color }" aria-hidden="true"></span>
            <span>{{ party.label }}</span>
            <span class="legend-count">{{ party.count }} 縣市</span>
          </li>
        </ul>

        <a
          v-if="partyHistory.source?.url"
          class="data-source"
          :href="partyHistory.source.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ partyHistory.source.label }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import config from '../json/data.json';
import TaiwanPartyHistoryLocation from './taiwanPartyHistoryLocation.vue';

const partyHistory = config.partyHistory;
const yearOptions = partyHistory.years;
const selectedYear = ref(partyHistory.defaultYear);

const selectedYearOption = computed(() => (
  yearOptions.find((item) => item.year === selectedYear.value)
));

const currentResults = computed(() => (
  partyHistory.results[String(selectedYear.value)] ?? {}
));

const locationColors = computed(() => Object.fromEntries(
  Object.entries(currentResults.value).map(([location, partyKey]) => [
    location,
    partyHistory.parties[partyKey]?.color ?? partyHistory.parties.pending.color
  ])
));

const locationDescriptions = computed(() => Object.fromEntries(
  Object.entries(currentResults.value).map(([location, partyKey]) => [
    location,
    partyHistory.parties[partyKey]?.label ?? partyHistory.parties.pending.label
  ])
));

const visibleParties = computed(() => {
  const counts = Object.values(currentResults.value).reduce((result, partyKey) => {
    result[partyKey] = (result[partyKey] ?? 0) + 1;
    return result;
  }, {});

  return Object.entries(partyHistory.parties)
    .filter(([key]) => counts[key])
    .map(([key, party]) => ({
      key,
      ...party,
      count: counts[key]
    }));
});

const mapLabel = computed(() => {
  const summary = visibleParties.value
    .map((party) => `${party.label} ${party.count} 個縣市`)
    .join('、');

  return `${selectedYear.value} 年縣市長選舉政黨版圖：${summary}`;
});
</script>

<style scoped>
.partyHistory-section {
  padding: 6rem 0 7rem;
  background: var(--color-coffee-0);
}

.partyHistory-container {
  position: relative;
  z-index: 1;
}

.section-subtitle {
  color: var(--color-coffee-300);
  text-align: center;
}

.section-subtitle h2 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600;
  line-height: 1.3;
}

.partyHistory_area {
  margin-top: 2.5rem;
  text-align: center;
}

.year-buttons {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 112px));
  justify-content: center;
  gap: clamp(1rem, 5vw, 3rem);
}

.year-button {
  min-height: 38px;
  padding: 0.35rem 1rem;
  border: 1px solid var(--color-coffee-300);
  border-radius: 999px;
  background: var(--color-coffee-50);
  color: var(--color-coffee-300);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.year-button:hover {
  transform: translateY(-1px);
}

.year-button:focus-visible {
  outline: 3px solid rgba(145, 127, 107, 0.32);
  outline-offset: 3px;
}

.year-button.is-active {
  background: var(--color-coffee-300);
  color: var(--color-coffee-0);
}

.history-map {
  width: 100%;
  max-width: 690px;
  margin: 2.25rem auto 0;
}

.year-note {
  width: fit-content;
  margin: -0.25rem auto 1rem;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  background: var(--color-coffee-50);
  color: var(--color-coffee-600);
  font-size: 0.95rem;
}

.party-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem 1.25rem;
  margin-top: 0.75rem;
  color: var(--color-coffee-600);
  font-size: 0.95rem;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.legend-color {
  width: 0.85rem;
  height: 0.85rem;
  border: 1px solid rgba(51, 42, 33, 0.2);
  border-radius: 50%;
  flex: 0 0 auto;
}

.legend-count {
  color: var(--color-coffee-300);
}

.data-source {
  display: inline-block;
  margin-top: 1.25rem;
  color: var(--color-coffee-300);
  font-size: 0.8rem;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

@media (max-width: 768px) {
  .partyHistory-section {
    padding: 4rem 0 5rem;
  }

  .partyHistory_area {
    margin-top: 2rem;
  }

  .year-buttons {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .year-button {
    min-height: 36px;
    padding-inline: 0.5rem;
    font-size: 1.05rem;
  }

  .history-map {
    margin-top: 1.75rem;
  }

  .party-legend {
    gap: 0.55rem 0.9rem;
    font-size: 0.85rem;
  }
}
</style>
