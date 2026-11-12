<template>
  <section v-show="isComponentVisible('Referendum')" id="referendum" class="referendum-section">
    <div class="container">
      <div class="section-header">
        <h2 class="referendum-title">
          <img :src="referendumIcon" alt="" aria-hidden="true" class="referendum-icon" />
          {{ sectionTitle }}
        </h2>
        <div class="referendum-divider"></div>
      </div>

      <div v-if="refreshFailed || !referendumResult" class="referendum-update" role="status">
        <p v-if="refreshFailed">{{ referendumResult ? '資料更新失敗，顯示上次成功取得的資料，稍後自動重試。' : '公投資料暫時無法載入，稍後自動重試。' }}</p>
        <p v-else-if="!referendumResult">公投資料載入中…</p>
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

            <div :class="['case-status', `status-${getCaseStatus(item).id}`]" role="status" aria-atomic="true">
              <svg class="status-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path v-if="item.status === 'passed'" d="m7 12 3 3 7-7" />
                <path v-else-if="item.status === 'failed'" d="m8 8 8 8m0-8-8 8" />
                <path v-else d="M12 6v6l4 2" />
              </svg>
              <span class="status-copy">
                <span class="status-caption">公投結果</span>
                <strong class="status-label">{{ getCaseStatus(item).label }}</strong>
              </span>
            </div>
          </header>

          <div v-if="item.results?.length" class="results-block">
            <div v-if="item.scale" class="result-scale" aria-hidden="true">
              <div class="result-scale-inner">
                <span class="threshold-label">
                  {{ item.scale.threshold }}
                  <strong>{{ item.scale.thresholdVotes == null ? '待更新' : formatVotes(item.scale.thresholdVotes) }}</strong>
                </span>
                <span class="electorate-label">
                  總選舉人數
                  <strong>{{ item.scale.totalElectors == null ? '待更新' : formatVotes(item.scale.totalElectors) }}</strong>
                </span>
              </div>
            </div>

            <div class="result-list">
              <div
                v-for="(result, resultIndex) in item.results"
                :key="result.id"
                :class="['result-row', getToneClass(result), { 'votes-below': clampPercentage(result.percentage) > 55 }]"
                :style="{ '--result-percentage': `${clampPercentage(result.percentage)}%` }"
              >
                <span class="result-label">{{ result.label }}</span>

                <div class="result-chart">
                  <div
                    class="result-track"
                    role="meter"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    :aria-valuenow="result.percentage == null ? undefined : clampPercentage(result.percentage)"
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

                  <template v-if="item.scale && resultIndex === 0">
                    <span class="reference-line threshold-line" aria-hidden="true"></span>
                    <span class="reference-line electorate-line" aria-hidden="true"></span>
                  </template>

                  <span class="result-votes" :aria-label="`${formatVotes(result.votes)} 票`">
                    {{ formatVotes(result.votes) }}
                  </span>
                </div>
              </div>
            </div>
            <div v-if="item.scale" class="result-scale result-scale-bottom" aria-hidden="true">
              <div class="result-scale-inner">
                <span>{{ item.scale.minimum }}</span>
                <span>{{ item.scale.maximum }}</span>
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
      <p v-if="referendumResult?.updateTime" class="referendum-timestamp">
        資料更新時間：{{ referendumResult.updateTime }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import referendumIcon from '../assets/images/election_referendum_icon.svg?url';
import config from '../json/data.json';
import { usePhase } from '../composables/usePhase.js';
import { fetchReferendum, REFERENDUM_URL } from '../utils/referendumApi.js';

const { isComponentVisible } = usePhase();
const referendumConfig = config.referendum ?? {};
const referendumResult = ref(null);
const refreshFailed = ref(false);

const sectionTitle = computed(() => referendumConfig.sectionTitle || '公民投票');
const caseStatuses = {
  passed: { id: 'passed', label: '通過' },
  failed: { id: 'failed', label: '不通過' },
  pending: { id: 'pending', label: '等待結果' }
};
const getCaseStatus = (item) => caseStatuses[item.status] ?? caseStatuses.pending;
const referendumItems = computed(() => (
  // The endpoint returns one referendum without a case ID; bind it to the first configured case.
  Array.isArray(referendumConfig.items) ? referendumConfig.items.map((item, index) => ({
    ...item,
    status: index === 0 ? referendumResult.value?.status ?? 'pending' : 'pending',
    scale: item.scale ? {
      ...item.scale,
      totalElectors: index === 0 ? referendumResult.value?.totalElectors ?? null : null,
      thresholdVotes: index === 0 ? referendumResult.value?.thresholdVotes ?? null : null
    } : null,
    notes: (item.notes ?? []).map((note) => ({
      ...note,
      text: note.source === 'totalElectors'
        ? `${note.text}${index === 0 && referendumResult.value?.totalElectors != null ? `${formatVotes(referendumResult.value.totalElectors)} 人。` : '待更新'}`
        : note.text
    })),
    results: (item.results ?? []).map((result) => ({
      ...result,
      percentage: null,
      votes: null,
      ...(index === 0 ? referendumResult.value?.results[result.id] : {})
    }))
  })) : []
));

let refreshTimer;
let controller;
let stopped = false;

const refresh = async () => {
  if (!isComponentVisible('Referendum')) {
    refreshTimer = setTimeout(refresh, 30000);
    return;
  }
  controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const url = import.meta.env.DEV ? '/api/referendum' : REFERENDUM_URL;
    const nextResult = await fetchReferendum(url, controller.signal);
    if (!stopped) {
      referendumResult.value = nextResult;
      refreshFailed.value = false;
    }
  } catch (error) {
    if (!stopped) {
      refreshFailed.value = true;
      console.error('更新公投資料失敗:', error);
    }
  } finally {
    clearTimeout(timeout);
    if (!stopped) refreshTimer = setTimeout(refresh, 30000);
  }
};

onMounted(refresh);
onUnmounted(() => {
  stopped = true;
  clearTimeout(refreshTimer);
  controller?.abort();
});

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

const formatPercentage = (value) => value == null ? '—' : `${percentageFormatter.format(clampPercentage(value))}%`;

const formatVotes = (value) => {
  if (value == null) return '—';
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
  width: min(100%, 80rem);
  margin: 0 auto;
  gap: clamp(4rem, 8vw, 6rem);
}

.referendum-case {
  --result-label-column: var(--result-votes-column);
  --result-votes-column: 10rem;
  --result-column-gap: 1rem;
  min-width: 0;
}

.referendum-update {
  margin-bottom: 1.5rem;
  color: var(--color-coffee-900);
  text-align: center;
  font-size: 0.9rem;
}

.referendum-update p {
  margin: 0.35rem 0;
}

.referendum-timestamp {
  width: min(100%, 80rem);
  margin: 1.5rem auto 0;
  color: var(--color-coffee-600);
  font-size: 0.9rem;
  text-align: right;
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
  text-align: center;
  text-wrap: pretty;
}

.case-status {
  --status-color: #5b5249;
  --status-background: #f3eeea;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  min-width: 15rem;
  margin-top: 1.4rem;
  padding: 1rem 1.75rem;
  border: 2px solid var(--status-color);
  border-radius: 1rem;
  background: var(--status-background);
  color: var(--status-color);
  text-align: left;
}

.status-failed {
  --status-color: #b51c25;
  --status-background: #fff0f1;
}

.status-passed {
  --status-color: #246839;
  --status-background: #edf8ef;
}

.status-icon {
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
}

.status-copy {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.status-caption {
  font-size: 0.875rem;
  font-weight: 500;
}

.status-label {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0.08em;
}

.results-block {
  max-width: 1280px;
  margin: clamp(2.75rem, 5vw, 3.75rem) auto 0;
}

.result-scale {
  display: grid;
  grid-template-columns: var(--result-label-column) minmax(0, 1fr) var(--result-votes-column);
  column-gap: var(--result-column-gap);
  margin-bottom: 1.5rem;
}

.result-scale-inner {
  grid-column: 2;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  color: #8b8b8b;
  font-size: clamp(0.85rem, 1.4vw, 1rem);
  line-height: 1.35;
  min-height: 3rem;
}

.threshold-label {
  position: absolute;
  left: 25%;
  bottom: 0;
  transform: translateX(-50%);
  white-space: nowrap;
  color: var(--color-coffee-900);
  font-weight: 500;
  text-align: center;
}

.electorate-label {
  position: absolute;
  right: 0;
  bottom: 0;
  color: var(--color-coffee-900);
  text-align: right;
  white-space: nowrap;
}

.threshold-label strong, .electorate-label strong {
  display: block;
  font-size: 1.15em;
  font-variant-numeric: tabular-nums;
}

.reference-line {
  position: absolute;
  top: -1.25rem;
  bottom: 0;
  z-index: 2;
  width: 2px;
  background: #111;
  transform: translateX(-50%);
  pointer-events: none;
}

.threshold-line { left: 25%; }
.electorate-line { left: 100%; }

.result-scale-bottom {
  margin: 0.65rem 0 0;
}

.result-scale-bottom .result-scale-inner { min-height: 0; }

.result-list {
  display: grid;
  gap: 1.7rem;
}

.result-row {
  display: grid;
  grid-template-columns: var(--result-label-column) minmax(0, 1fr) var(--result-votes-column);
  grid-template-areas: "label bar reserve";
  align-items: center;
  column-gap: var(--result-column-gap);
}

.result-row.tone-agree { --result-color: #8e3a52; }
.result-row.tone-disagree { --result-color: #604781; }
.result-row.tone-neutral { --result-color: var(--color-coffee-600); }

.result-chart {
  position: relative;
  grid-area: bar;
  min-width: 0;
  --percentage-space: 6rem;
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
  background: var(--result-color);
}

.result-fill.tone-disagree {
  background: var(--result-color);
}

.result-fill.tone-neutral {
  background: var(--result-color);
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
  position: absolute;
  left: calc(max(var(--result-percentage), var(--percentage-space)) + 0.75rem);
  top: 50%;
  transform: translateY(-50%);
  color: var(--result-color);
  font-family: 'Outfit', 'Noto Sans TC', sans-serif;
  font-size: clamp(1.35rem, 2.4vw, 1.8rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.25;
  text-align: left;
  white-space: nowrap;
  transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.case-notes {
  display: grid;
  gap: 0.35rem;
  margin: 3rem calc(var(--result-votes-column) + var(--result-column-gap)) 0 calc(var(--result-label-column) + var(--result-column-gap));
  color: #9b8977;
  font-size: clamp(0.85rem, 1.35vw, 0.95rem);
  line-height: 1.6;
  text-align: left;
}

.case-notes li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

@media (min-width: 1024px) {
  .container { max-width: 1440px; }
  .case-notes { margin-right: 0; }
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

  .case-status {
    margin-top: 1.15rem;
    min-width: 0;
    max-width: 100%;
    padding: 0.85rem 1.25rem;
  }

  .results-block {
    --result-votes-column: 8rem;
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
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "label"
      "bar";
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
    left: 0.5rem;
    font-size: 1.3rem;
  }

  .result-chart { --percentage-space: 4.25rem; }

  .result-votes {
    font-size: 1.25rem;
  }

  .result-row.votes-below { padding-bottom: 2rem; }

  .votes-below .result-votes {
    top: calc(100% + 0.4rem);
    left: auto;
    right: 0;
    transform: none;
  }

  .case-notes {
    margin-top: 2.25rem;
    margin-inline: 0;
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
  .result-fill, .result-votes {
    transition: none;
  }
}
</style>
