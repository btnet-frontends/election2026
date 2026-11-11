<template>
  <aside class="vote-ticker" aria-label="即時開票跑馬燈">
    <div class="ticker-heading">
      <span class="ticker-label"><span class="live-dot" aria-hidden="true"></span>即時開票</span>
      <button v-if="entries.length" type="button" :aria-pressed="paused" @click="paused = !paused">
        {{ paused ? '繼續捲動' : '暫停捲動' }}
      </button>
    </div>
    <div v-if="entries.length" class="ticker-viewport" tabindex="0" aria-label="各選區開票資訊，滑鼠移入或鍵盤聚焦可暫停捲動">
      <div class="ticker-track" :class="{ paused }" :style="{ '--ticker-duration': `${Math.max(20, entries.length * 5)}s` }">
        <ul v-for="copy in 2" :key="copy" class="ticker-group" :aria-hidden="copy === 2 ? 'true' : undefined">
          <li v-for="entry in entries" :key="`${entry.city}-${entry.id}`" class="ticker-entry">
            <span class="ticker-city">{{ entry.city }}</span>
            <img v-if="partyImageUrl(entry.partyImage)" class="party-icon" :src="partyImageUrl(entry.partyImage)" :alt="entry.party" :title="entry.party" />
            <span v-else class="party-badge" :style="{ backgroundColor: entry.color }" :aria-label="entry.party" :title="entry.party">{{ entry.shortName }}</span>
            <span class="candidate-name">{{ entry.name }}</span>
            <strong class="candidate-votes">{{ entry.votes == null ? '開票中' : `${formatVotes(entry.votes)} 票` }}</strong>
            <img v-if="entry.elected" class="elected-mark" :src="electedIcon" alt="當選" title="當選" />
          </li>
        </ul>
      </div>
    </div>
    <p v-else class="ticker-empty" role="status">{{ refreshFailed ? '開票資料暫時無法載入，稍後自動重試' : '等待開票資料' }}</p>
    <p class="ticker-note">
      <span>資料來源：中央選舉委員會</span>
      <span v-if="result?.updateTime">更新時間：{{ result.updateTime }}</span>
      <span v-if="refreshFailed && entries.length" role="status">更新暫時中斷，顯示最後取得資料</span>
    </p>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import electedIcon from '../assets/images/elected.png?url';

const props = defineProps({
  result: { type: Object, default: null },
  refreshFailed: { type: Boolean, default: false }
});
const paused = ref(false);
const entries = computed(() => Object.entries(props.result?.cities ?? {}).flatMap(
  ([city, candidates]) => candidates.map((candidate) => ({ ...candidate, city }))
));
const partyImages = import.meta.glob('../assets/images/party_icon/*.png', {
  eager: true, query: '?url', import: 'default'
});
const partyImageUrl = (filename) => partyImages[`../assets/images/party_icon/${filename}`];
const numberFormat = new Intl.NumberFormat('zh-TW');
const formatVotes = (votes) => numberFormat.format(votes);
</script>

<style scoped>
.vote-ticker {
  margin: 0 auto;
  max-width: 1400px;
  overflow: hidden;
  border: 1px solid var(--color-coffee-300);
  border-radius: 1rem;
  background: #fff;
  color: var(--color-coffee-900);
}
.ticker-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 1rem;
  background: var(--color-coffee-900);
  color: #fff;
}
.ticker-label { display: flex; align-items: center; gap: 0.6rem; font-weight: 700; }
.live-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: #ffbd69; }
button {
  padding: 0.3rem 0.6rem;
  border: 1px solid currentColor;
  border-radius: 0.35rem;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}
button:focus-visible, .ticker-viewport:focus-visible { outline: 3px solid #d99538; outline-offset: -3px; }
.ticker-viewport { overflow: hidden; }
.ticker-track { display: flex; width: max-content; animation: ticker-scroll var(--ticker-duration) linear infinite; }
.ticker-group { display: flex; flex: 0 0 auto; align-items: center; margin: 0; padding: 0; list-style: none; }
.ticker-entry { display: flex; flex: 0 0 auto; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; white-space: nowrap; }
.ticker-entry::after { content: ''; height: 1.5rem; width: 1px; margin-left: 0.75rem; background: var(--color-coffee-300); }
.ticker-city { border-radius: 0.35rem; padding: 0.25rem 0.6rem; background: var(--color-coffee-50); font-weight: 700; }
.party-icon, .party-badge { width: 1.75rem; height: 1.75rem; flex: 0 0 auto; object-fit: contain; }
.party-badge { display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; color: #fff; font-size: 0.85rem; }
.candidate-name { font-weight: 600; }
.candidate-votes { font-variant-numeric: tabular-nums; color: #996323; }
.elected-mark { width: 1.9rem; height: 1.9rem; object-fit: contain; }
.ticker-note { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; margin: 0; padding: 0.5rem 1rem; border-top: 1px solid var(--color-coffee-300); font-size: 0.75rem; }
.ticker-empty { margin: 0; padding: 1rem; text-align: center; }
.ticker-track.paused, .ticker-viewport:hover .ticker-track, .ticker-viewport:focus-within .ticker-track { animation-play-state: paused; }
@keyframes ticker-scroll { to { transform: translateX(-50%); } }
@media (max-width: 575px) {
  .ticker-entry { gap: 0.5rem; padding: 0.85rem 1rem; font-size: 0.9rem; }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-viewport { overflow-x: auto; }
  .ticker-track { animation: none; }
  .ticker-group[aria-hidden='true'] { display: none; }
}
</style>
