<template>
  <section id="referendum" class="referendum-section">
    <div class="container">
      <div class="section-header">
        <h2 class="referendum-title">
          <img :src="referendumIcon" alt="" aria-hidden="true" class="referendum-icon" />
          {{ sectionTitle }}
        </h2>
        <div class="referendum-divider"></div>
      </div>

      <div class="referendum_area referendum-list">
        <article
          v-for="(item, itemIndex) in referendumItems"
          :key="item.id || item.number || itemIndex"
          class="referendum-case"
          :aria-labelledby="getCaseTitleId(item, itemIndex)"
        >
          <header class="case-header">
            <h3 :id="getCaseTitleId(item, itemIndex)" class="case-title">
              <span v-if="item.number !== undefined && item.number !== null">第{{ item.number }}案</span>
              {{ item.title }}
            </h3>
            <p v-if="item.question" class="case-question">{{ item.question }}</p>

            <div
              v-if="item.statusOptions?.length"
              class="status-options"
              aria-label="公投結果狀態"
            >
              <span
                v-for="statusOption in item.statusOptions"
                :key="statusOption.id"
                :class="[
                  'status-badge',
                  `status-${statusOption.id}`,
                  { 'is-active': item.status === statusOption.id }
                ]"
              >
                {{ statusOption.label }}
              </span>
            </div>
          </header>

          <div v-if="item.results?.length" class="results-block">
            <div v-if="item.scale" class="result-scale" aria-hidden="true">
              <div class="result-scale-inner">
                <span>{{ item.scale.minimum }}</span>
                <span class="threshold-label">{{ item.scale.threshold }}</span>
                <span>{{ item.scale.maximum }}</span>
              </div>
            </div>

            <div class="result-list">
              <div
                v-for="result in item.results"
                :key="result.id"
                class="result-row"
              >
                <span class="result-label">{{ result.label }}</span>

                <div
                  class="result-track"
                  role="meter"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-valuenow="clampPercentage(result.percentage)"
                  :aria-valuetext="getResultAriaText(result)"
                >
                  <span
                    :class="['result-fill', getToneClass(result)]"
                    :style="{ width: `${clampPercentage(result.percentage)}%` }"
                    aria-hidden="true"
                  ></span>
                  <span
                    :class="[
                      'result-percentage',
                      { 'is-small': clampPercentage(result.percentage) < 12 }
                    ]"
                  >
                    {{ formatPercentage(result.percentage) }}
                  </span>
                </div>

                <span class="result-votes" :aria-label="`${formatVotes(result.votes)} 票`">
                  {{ formatVotes(result.votes) }}
                </span>
              </div>
            </div>
          </div>

          <ol v-if="item.notes?.length" class="case-notes">
            <li v-for="(note, noteIndex) in item.notes" :key="note.id || noteIndex">
              <span class="note-label">{{ note.label || `註 ${noteIndex + 1}` }}</span>
              <span>{{ note.text }}</span>
            </li>
          </ol>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import referendumIcon from '../assets/images/election_referendum_icon.svg?url';
import config from '../json/data.json';

const referendumConfig = config.referendum ?? {};

const sectionTitle = computed(() => referendumConfig.sectionTitle || '公民投票');
const referendumItems = computed(() => (
  Array.isArray(referendumConfig.items) ? referendumConfig.items : []
));

const clampPercentage = (value) => {
  const percentage = Number(value);
  if (!Number.isFinite(percentage)) return 0;
  return Math.min(100, Math.max(0, percentage));
};

const percentageFormatter = new Intl.NumberFormat('zh-TW', {
  maximumFractionDigits: 1
});
const voteFormatter = new Intl.NumberFormat('zh-TW', {
  maximumFractionDigits: 0
});

const formatPercentage = (value) => `${percentageFormatter.format(clampPercentage(value))}%`;

const formatVotes = (value) => {
  const votes = Number(value);
  return voteFormatter.format(Number.isFinite(votes) ? Math.max(0, votes) : 0);
};

const getToneClass = (result) => (
  result.tone === 'agree' || result.id === 'agree'
    ? 'tone-agree'
    : result.tone === 'disagree' || result.id === 'disagree'
      ? 'tone-disagree'
      : 'tone-neutral'
);

const getResultAriaText = (result) => (
  `${result.label}：${formatPercentage(result.percentage)}，${formatVotes(result.votes)} 票`
);

const getCaseTitleId = (item, index) => `referendum-title-${item.id || item.number || index}`;

</script>

<style scoped>
.referendum-section {
  padding: 6rem 0 7rem;
  background: var(--color-coffee-0);
}

.container {
  position: relative;
  z-index: 1;
}

.section-header {
  margin-bottom: 3.5rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0;
  text-align: center;
}

.referendum-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.referendum-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-coffee-900);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  line-height: 1.35;
}

.referendum-divider {
  width: min(20rem, 100%);
  height: 2px;
  background-color: var(--color-coffee-300);
}

.referendum-list {
  display: grid;
  width: min(100%, 56.25rem);
  margin: 0 auto;
  gap: clamp(4rem, 8vw, 6rem);
}

.referendum-case {
  min-width: 0;
}

.referendum-case + .referendum-case {
  padding-top: clamp(4rem, 8vw, 6rem);
  border-top: 1px solid var(--color-coffee-200);
}

.case-header {
  text-align: center;
}

.case-title {
  margin: 0;
  color: var(--color-coffee-300);
  font-size: clamp(1.5rem, 2.8vw, 1.875rem);
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.015em;
}

.case-title span {
  margin-right: 0.35em;
}

.case-question {
  max-width: 53rem;
  margin: 1.25rem auto 0;
  color: var(--color-coffee-900);
  font-size: clamp(1rem, 1.55vw, 1.125rem);
  font-weight: 500;
  line-height: 1.6;
  text-align: left;
  text-wrap: pretty;
}

.status-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
  margin-top: 1.4rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.7rem;
  padding: 0.4rem 0.8rem;
  border: 1.5px solid currentColor;
  border-radius: 999px;
  background: var(--color-coffee-0);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;
}

.status-failed {
  color: var(--color-primary);
}

.status-passed {
  color: #527400;
}

.status-failed.is-active {
  background: var(--color-primary);
  color: #fff;
}

.status-passed.is-active {
  background: #527400;
  color: #fff;
}

.results-block {
  --result-label-column: 4.5rem;
  --result-votes-column: 4.5rem;
  --result-column-gap: 1rem;
  margin-top: clamp(2.75rem, 5vw, 3.75rem);
}

.result-scale {
  display: grid;
  grid-template-columns: var(--result-label-column) minmax(0, 1fr) var(--result-votes-column);
  column-gap: var(--result-column-gap);
  margin-bottom: 1.5rem;
}

.result-scale-inner {
  grid-column: 2;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  color: #8b8b8b;
  font-size: clamp(0.85rem, 1.4vw, 1rem);
  line-height: 1.35;
}

.result-scale-inner > :last-child {
  justify-self: end;
}

.threshold-label {
  color: var(--color-coffee-900);
  font-weight: 500;
  text-align: center;
}

.result-list {
  display: grid;
  gap: 1.7rem;
}

.result-row {
  display: grid;
  grid-template-columns: var(--result-label-column) minmax(0, 1fr) var(--result-votes-column);
  grid-template-areas: "label bar votes";
  align-items: center;
  column-gap: var(--result-column-gap);
}

.result-label {
  grid-area: label;
  color: var(--color-coffee-900);
  font-size: clamp(1.05rem, 1.8vw, 1.25rem);
  line-height: 1.25;
  text-align: right;
  white-space: nowrap;
}

.result-track {
  position: relative;
  grid-area: bar;
  height: clamp(3.25rem, 6vw, 3.85rem);
  overflow: hidden;
  border-radius: 0.65rem;
  background: #dedbd6;
}

.result-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 0.65rem 0 0 0.65rem;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.result-fill.tone-agree {
  background: #8e3a52;
}

.result-fill.tone-disagree {
  background: #604781;
}

.result-fill.tone-neutral {
  background: var(--color-coffee-600);
}

.result-percentage {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 1rem;
  color: #fff;
  font-family: 'Outfit', 'Noto Sans TC', sans-serif;
  font-size: clamp(1.5rem, 3.2vw, 2rem);
  font-weight: 400;
  line-height: 1;
  transform: translateY(-50%);
}

.result-percentage.is-small {
  color: var(--color-coffee-900);
}

.result-votes {
  grid-area: votes;
  color: var(--color-coffee-900);
  font-family: 'Outfit', 'Noto Sans TC', sans-serif;
  font-size: 1rem;
  line-height: 1.25;
  text-align: right;
  white-space: nowrap;
}

.case-notes {
  display: grid;
  gap: 0.35rem;
  margin: clamp(2.5rem, 5vw, 3.25rem) 0 0 calc(var(--result-label-column) + var(--result-column-gap));
  margin-top: 3rem;
  color: #9b8977;
  font-size: clamp(0.85rem, 1.35vw, 0.95rem);
  line-height: 1.6;
}

.case-notes li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.note-label {
  flex: 0 0 auto;
  min-width: 3rem;
  padding: 0.08rem 0.55rem;
  border-radius: 999px;
  background: #d2c9bd;
  color: #8c7964;
  font-weight: 600;
  line-height: 1.45;
  text-align: center;
}

@media (max-width: 767px) {
  .referendum-section {
    padding: 4rem 0 5rem;
  }

  .section-header {
    margin-bottom: 2.75rem;
  }

  .referendum-icon {
    width: 27px;
    height: 27px;
  }

  .case-question {
    margin-top: 1rem;
  }

  .status-options {
    margin-top: 1.15rem;
  }

  .status-badge {
    min-height: 2.4rem;
    font-size: 0.9375rem;
  }

  .results-block {
    margin-top: 2.5rem;
  }

  .result-scale {
    grid-template-columns: minmax(0, 1fr);
    margin-bottom: 1.25rem;
  }

  .result-scale-inner {
    grid-column: 1;
    font-size: 0.8rem;
  }

  .result-list {
    gap: 1.5rem;
  }

  .result-row {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "label votes"
      "bar bar";
    gap: 0.55rem 1rem;
  }

  .result-label {
    font-size: 1rem;
    font-weight: 600;
    text-align: left;
  }

  .result-track {
    height: 3rem;
    border-radius: 0.55rem;
  }

  .result-fill {
    border-radius: 0.55rem 0 0 0.55rem;
  }

  .result-percentage {
    left: 0.85rem;
  }

  .result-votes {
    font-size: 0.95rem;
  }

  .case-notes {
    margin-top: 2.25rem;
    margin-left: 0;
  }
}

@media (max-width: 420px) {
  .referendum-title {
    gap: 0.55rem;
  }

  .case-title span {
    display: block;
    margin: 0 0 0.15rem;
  }

  .threshold-label {
    max-width: 11.5rem;
    padding: 0 0.4rem;
  }

  .case-notes li {
    gap: 0.55rem;
  }

  .note-label {
    min-width: 2.75rem;
    padding-inline: 0.4rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .result-fill {
    transition: none;
  }
}
</style>
