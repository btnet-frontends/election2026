<template>
  <article class="candidate-card">
    <div class="candidate-heading">
      <img v-if="partyImage" class="party-icon" :src="partyImage" :alt="candidate.party" :title="candidate.party" />
      <span v-else class="party-fallback" :title="candidate.party">{{ candidate.party || '未提供政黨' }}</span>
      <span class="candidate-number">{{ candidate.number == null ? '號次待更新' : `${candidate.number} 號` }}</span>
      <h5 class="candidate-name">{{ candidate.name }}</h5>
      <img v-if="isElected" :src="electedIcon" class="elected-mark" alt="當選" title="當選" />
    </div>

    <div class="vote-comparison">
      <div class="vote-track" aria-hidden="true">
        <span class="vote-fill" :style="{ width: `${voteBarWidth}%` }"></span>
      </div>
      <dl class="candidate-votes">
        <div><dt>得票數</dt><dd>{{ formatVotes(candidate.votes) }}</dd></div>
        <div><dt>得票率</dt><dd>{{ formatPercent(candidate.percent) }}</dd></div>
      </dl>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import parties from '../json/parties.json' with { type: 'json' };
import { getVoteBarWidth } from '../utils/voteComparison.js';

const partyImages = import.meta.glob('../assets/images/party_icon/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
});
const partyImageById = new Map(
  parties.map((party) => [party.id, partyImages[`../assets/images/party_icon/${party.image}`]])
);
const props = defineProps({
  candidate: { type: Object, required: true },
  electedIcon: { type: String, required: true },
  constituencyMaxVotes: { type: Number, default: 0 }
});
const isElected = computed(() => props.candidate.elected === true);
const partyImage = computed(() => partyImageById.get(props.candidate.partyId));
const voteBarWidth = computed(() => getVoteBarWidth(props.candidate.votes, props.constituencyMaxVotes));
const voteFormatter = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 });
const formatVotes = (value) => value == null ? '待更新' : `${voteFormatter.format(value)} 票`;
const formatPercent = (value) => value == null ? '待更新' : `${percentFormatter.format(value)}%`;
</script>

<style scoped>
.candidate-card {
  min-width: 0;
  padding: 1.4rem 0.5rem;
}

.candidate-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
}

.party-icon {
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  object-fit: contain;
}

.party-fallback {
  color: var(--color-coffee-600);
  font-size: 0.9rem;
}

.candidate-number {
  padding: 0.15rem 0.55rem;
  border-radius: 0.35rem;
  background: var(--color-coffee-150);
  color: var(--color-coffee-600);
  font-size: 0.95rem;
  font-weight: 700;
}

.candidate-name {
  min-width: 0;
  color: var(--color-coffee-900);
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.elected-mark {
  flex: 0 0 auto;
  width: 1.65rem;
  height: 1.65rem;
  object-fit: contain;
}

.vote-comparison {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 17rem;
  align-items: center;
  gap: 1.25rem;
  margin-top: 0.7rem;
}

.vote-track {
  height: 0.85rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-coffee-200);
}

.vote-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--color-coffee-accent);
  transition: width 0.3s ease;
}

.candidate-votes {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 1rem;
}

.candidate-votes > div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
}

.candidate-votes dt {
  color: var(--color-coffee-600);
  font-size: 0.875rem;
}

.candidate-votes dd {
  margin: 0;
  color: var(--color-coffee-900);
  font-size: 1.1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .candidate-card { padding: 1.25rem 0; }
  .candidate-heading { gap: 0.5rem; }
  .candidate-name { font-size: 1.2rem; }
  .vote-comparison { grid-template-columns: minmax(0, 1fr); gap: 0.5rem; }
  .candidate-votes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (prefers-reduced-motion: reduce) {
  .vote-fill { transition: none; }
}
</style>
