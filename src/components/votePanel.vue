<template>
  <div class="vote-panel">
    <div class="location-selector">
      <label for="vote-location">請選擇縣市：</label>
      <div class="select-wrap">
        <select id="vote-location" v-model="selectedLocation" aria-label="選擇開票縣市">
          <option v-for="location in locations" :key="location" :value="location">
            {{ location }}
          </option>
        </select>
        <span class="select-arrow" aria-hidden="true"></span>
      </div>
    </div>

    <div class="result-card" aria-live="polite">
      <section
        v-for="(election, electionIndex) in selectedElections"
        :key="election.year"
        class="election-result"
      >
        <h3>{{ election.year }}</h3>
        <div class="year-divider"></div>

        <ul class="candidate-list">
          <li v-for="candidate in election.candidates" :key="`${election.year}-${candidate.name}`">
            <div class="candidate">
              <span
                class="party-badge"
                :style="{ backgroundColor: candidate.color }"
                :aria-label="candidate.party"
                :title="candidate.party"
              >
                {{ candidate.shortName }}
              </span>
              <span class="candidate-name">{{ candidate.name }}</span>
            </div>

            <div class="vote-result">
              <span
                v-if="candidate.elected"
                class="elected-mark"
                aria-label="當選"
                title="當選"
              >
                <img :src="elected_icon" alt="當選">
            </span>
              <div class="numbers">
                <strong :style="{ color: candidate.color }">
                  {{ formatPercent(candidate.percent) }}
                </strong>
                <span>{{ formatVotes(candidate.votes) }} 票</span>
              </div>
            </div>
          </li>
        </ul>

        <div v-if="electionIndex < selectedElections.length - 1" class="section-gap"></div>
      </section>
    </div>

    <div class="data-note">
      <p>資料更新時間：{{ updateTime }}</p>
      <p>資料來源：中央選舉委員會</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import elected_icon from '../assets/images/elected.png?url';

const locations = [
  '台北市',
  '新北市',
  '桃園市',
  '台中市',
  '台南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義市',
  '嘉義縣',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '台東縣',
  '澎湖縣',
  '金門縣',
  '連江縣'
];

const partyStyles = {
  kmt: { party: '中國國民黨', shortName: '國', color: '#1717a8' },
  dpp: { party: '民主進步黨', shortName: '民', color: '#559637' },
  tpp: { party: '台灣民眾黨', shortName: '眾', color: '#72c3ca' }
};

const defaultElections = [
  {
    year: 2026,
    candidates: [
      { ...partyStyles.kmt, name: '某某某', percent: 50.02, votes: 500000, elected: true },
      { ...partyStyles.dpp, name: '某某某', percent: 50.02, votes: 500000 },
      { ...partyStyles.tpp, name: '某某某', percent: 50.02, votes: 500000 },
      { ...partyStyles.dpp, name: '某某某', percent: 50.02, votes: 500000 },
      { ...partyStyles.dpp, name: '某某某', percent: 50.02, votes: 500000 }
    ]
  },
  {
    year: 2022,
    candidates: [
      { ...partyStyles.kmt, name: '某某某', percent: 50.02, votes: 500000, elected: true },
      { ...partyStyles.dpp, name: '某某某', percent: 50.02, votes: 500000 }
    ]
  }
];

const electionData = Object.fromEntries(
  locations.map((location) => [location, defaultElections])
);

const selectedLocation = ref('台北市');
const updateTime = '2022/11/26 23:53';
const selectedElections = computed(() => electionData[selectedLocation.value] ?? defaultElections);

const formatVotes = (votes) => new Intl.NumberFormat('zh-TW').format(votes);
const formatPercent = (percent) => `${Number(percent).toFixed(2)}%`;
</script>

<style scoped>
.vote-panel {
  --panel-brown: #917f6b;
  --panel-accent: #996323;
  width: 100%;
  color: var(--panel-brown);
}

.location-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin-bottom: 1.75rem;
  font-size: clamp(0.9rem, 1.5vw, 1.2rem);
  line-height: 1;
}

.location-selector label {
  white-space: nowrap;
}

.select-wrap {
  position: relative;
  width: min(17rem, 55%);
}

.select-wrap select {
  width: 100%;
  min-height: 3.25rem;
  appearance: none;
  -webkit-appearance: none;
  border: 2px solid #171717;
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.18);
  color: var(--panel-brown);
  padding: 0.55rem 3.5rem 0.55rem 1.25rem;
  font: inherit;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
}

.select-wrap select:focus-visible {
  outline: 3px solid rgba(153, 99, 35, 0.3);
  outline-offset: 3px;
}

.select-arrow {
  position: absolute;
  top: 50%;
  right: 1.55rem;
  width: 0;
  height: 0;
  border-left: 0.55rem solid transparent;
  border-right: 0.55rem solid transparent;
  border-top: 0.9rem solid #8d642d;
  transform: translateY(-35%);
  pointer-events: none;
}

.result-card {
  overflow: hidden;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.96);
  padding: 1.9rem 1.75rem 2.2rem;
}

.election-result h3 {
  color: var(--panel-accent);
  font-size: clamp(1.35rem, 2.3vw, 1.85rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.2em;
  text-align: center;
  text-indent: 0.2em;
}

.year-divider {
  width: 100%;
  height: 1px;
  margin: 0.8rem 0 1.75rem;
  background: var(--panel-brown);
}

.candidate-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.candidate-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: 1rem;
  padding: 0 0.9rem;
}

.candidate,
.vote-result {
  display: flex;
  align-items: center;
}

.candidate {
  min-width: 0;
  gap: 0.9rem;
}

.party-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2.55rem;
  height: 2.55rem;
  border-radius: 50%;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
}

.candidate-name {
  overflow: hidden;
  color: var(--panel-brown);
  font-size: clamp(0.9rem, 1.5vw, 1.2rem);
}

.vote-result {
  justify-content: flex-end;
  gap: 1rem;
}

.numbers {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  min-width: 6.75rem;
  line-height: 1.1;
}

.numbers strong {
  font-size: clamp(1.45rem, 3.1vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.numbers span {
  margin-top: 0.35rem;
  color: var(--panel-brown);
  font-size: clamp(0.8rem, 1.5vw, 1rem);
  white-space: nowrap;
}

.elected-mark {
  position: relative;
  flex: 0 0 auto;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
}

.section-gap {
  height: 2.4rem;
}

.data-note {
  margin-top: 3.5rem;
  font-size: clamp(0.8rem, 1.35vw, 0.95rem);
  font-weight: 500;
  line-height: 1.35;
}

@media (max-width: 1366px) {
  .location-selector {
    font-size: clamp(0.85rem, 1.2vw, 1.05rem);
  }

    .vote-result {
        gap: 0;
    }

  .election-result h3 {
    font-size: clamp(1.2rem, 1.8vw, 1.6rem);
  }

  .party-badge {
    font-size: 0.95rem;
  }

  .candidate-name {
    font-size: clamp(0.85rem, 1.2vw, 1rem);
  }

  .numbers strong {
    font-size: clamp(1.25rem, 2.2vw, 1.7rem);
  }

  .numbers span {
    font-size: clamp(0.75rem, 1.1vw, 0.9rem);
  }

  .data-note {
    font-size: clamp(0.75rem, 1vw, 0.85rem);
  }
}


@media (max-width: 680px) {
  .location-selector {
    align-items: stretch;
    flex-direction: column;
    gap: 0.75rem;
  }

  .select-wrap {
    width: 100%;
  }

  .select-wrap select {
    min-height: 3rem;
  }

  .result-card {
    padding: 1.4rem 1rem 1.75rem;
  }

  .candidate-list {
    gap: 1.75rem;
  }

  .candidate-list li {
    gap: 0.6rem;
    padding: 0;
  }

  .candidate {
    gap: 0.55rem;
  }

  .party-badge {
    width: 2.15rem;
    height: 2.15rem;
    font-size: 0.95rem;
  }

  .numbers {
    min-width: 5.9rem;
  }

  .data-note {
    margin-top: 2.5rem;
  }
}

@media (max-width: 410px) {
  .result-card {
    padding-inline: 0.75rem;
  }

  .candidate-name {
    max-width: 4rem;
  }
}
</style>
