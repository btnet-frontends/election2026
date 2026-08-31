<template>
  <section id="seats" class="seats-section">
    <div class="container seats-container">
      <div class="section-header">
        <span class="seats-title">
          <img :src="statisticsIcon" alt="statistics" class="statistics-icon" />
          選情統計
        </span>
        <div class="seats-divider"></div>
      </div>
      <div class="section-subtitle">
        <h2>• 各縣市議員席次 •</h2>
      </div>

      <div v-if="hasData" class="seat_area">
        <div class="seat-filters">
          <div class="select-wrap">
            <select v-model.number="selectedYear" aria-label="選擇年份">
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
            <span class="select-arrow" aria-hidden="true"></span>
          </div>

          <div class="select-wrap">
            <select v-model="selectedCity" aria-label="選擇縣市">
              <option v-for="city in cities" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
            <span class="select-arrow" aria-hidden="true"></span>
          </div>
        </div>

        <p v-if="isPendingYear" class="seat-pending" role="status">尚未開票</p>

        <template v-else>
        <div class="seat-chart">
          <svg
            class="seat-chart-svg"
            viewBox="0 0 1000 600"
            role="img"
            :aria-label="chartAriaLabel"
          >
            <circle
              v-for="seat in seatPoints"
              :key="seat.id"
              class="seat-dot"
              :class="{ 'is-dimmed': hoveredPartyKey && seat.partyKey !== hoveredPartyKey }"
              :cx="seat.x"
              :cy="seat.y"
              :r="seat.radius"
              :fill="seat.color"
              :data-party="seat.partyKey"
              aria-hidden="true"
              @mouseenter="hoveredPartyKey = seat.partyKey"
              @mouseleave="hoveredPartyKey = null"
            />

            <text
              class="seat-total"
              x="500"
              y="535"
              text-anchor="middle"
              :style="hoveredParty ? { fill: hoveredParty.textColor } : null"
              aria-hidden="true"
            >
              {{ hoveredParty ? hoveredParty.seats : totalSeats }}
            </text>
          </svg>
        </div>

        <ul
          class="seat-legend"
          :style="{ '--legend-columns': Math.min(currentParties.length, 3) }"
          aria-label="政黨得票率"
        >
          <li
            v-for="party in legendParties"
            :key="party.key"
            :style="{ color: party.textColor }"
          >
            <span
              class="legend-square"
              :style="{ backgroundColor: party.dotColor }"
              aria-hidden="true"
            ></span>
            <span>{{ party.label }}：{{ party.voteRate }}%</span>
          </li>
        </ul>

        <div class="seat-notes">
          <p>⏹︎ 為得票率</p>
          <p>資料來源：中央選舉委員會</p>
        </div>
        </template>
      </div>

      <p v-else class="seat-empty" role="status">席次資料載入中，請稍後再試。</p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import statisticsIcon from '../assets/images/statistics_icon.svg?url';
import { usePhase } from '../composables/usePhase.js';
import { ELECTION_YEAR } from '../utils/schedule.js';

const props = defineProps({
  // fetchSeatHistory() 的結果：{ years, data, source }；抓取失敗時為 null
  history: {
    type: Object,
    default: null
  }
});

// 顯示名稱與排序設定；顏色一律來自 history 內的政黨色票，缺少時用 fallback
const partyMeta = {
  '無黨籍/其他': { label: '無黨籍', chartOrder: 50, legendOrder: 1, textColor: '#888888' },
  中國國民黨: { label: '國民黨', chartOrder: 10, legendOrder: 2 },
  民主進步黨: { label: '民進黨', chartOrder: 100, legendOrder: 3 },
  台灣民眾黨: { label: '民眾黨', chartOrder: 30, legendOrder: 4 },
  時代力量: { label: '時代力量', chartOrder: 40, legendOrder: 5 },
  親民黨: { label: '親民黨', chartOrder: 35, legendOrder: 6 },
  新黨: { label: '新黨', chartOrder: 20, legendOrder: 6 },
  社會民主黨: { label: '社民黨', chartOrder: 60, legendOrder: 6 },
  綠黨: { label: '台灣綠黨', chartOrder: 60, legendOrder: 6 },
  台灣基進: { label: '台灣基進', chartOrder: 70, legendOrder: 6 },
  台灣團結聯盟: { label: '台聯', chartOrder: 65, legendOrder: 6 },
  無黨團結聯盟: { label: '無盟', chartOrder: 55, legendOrder: 6 }
};

const FALLBACK_DOT_COLOR = '#dedede';

const darkenHex = (hex, ratio) => {
  const num = parseInt(hex.slice(1), 16);
  return `#${[16, 8, 0]
    .map((shift) => Math.round(((num >> shift) & 0xff) * (1 - ratio))
      .toString(16)
      .padStart(2, '0'))
    .join('')}`;
};

const isLightColor = (hex) => {
  const num = parseInt(hex.slice(1), 16);
  const brightness = (0.299 * ((num >> 16) & 0xff))
    + (0.587 * ((num >> 8) & 0xff))
    + (0.114 * (num & 0xff));
  return brightness > 150;
};

const { phase } = usePhase();

const seatsByYear = computed(() => props.history?.data ?? {});
const apiYears = computed(() => props.history?.years ?? []);

// SCHEDULE_START 前隱藏 2026；之後即使 API 尚無 2026 資料也顯示選項（內容為尚未開票）
const years = computed(() => {
  if (phase.value === 'default') {
    return apiYears.value.filter((year) => year < ELECTION_YEAR);
  }
  return apiYears.value.includes(ELECTION_YEAR)
    ? apiYears.value
    : [ELECTION_YEAR, ...apiYears.value];
});

const hasData = computed(() => years.value.length > 0);
const selectedYear = ref(years.value[0] ?? null);

const isPendingYear = computed(() => !seatsByYear.value[selectedYear.value]);

// 尚未開票的年份沒有縣市清單，改用最近一屆的縣市維持選單可用
const cities = computed(() => {
  const ownCities = Object.keys(seatsByYear.value[selectedYear.value] ?? {});
  if (ownCities.length > 0) return ownCities;
  const fallbackYear = apiYears.value.find((year) => seatsByYear.value[year]);
  return Object.keys(seatsByYear.value[fallbackYear] ?? {});
});
const selectedCity = ref(cities.value[0] ?? null);

const currentSeatData = computed(() => (
  seatsByYear.value[selectedYear.value]?.[selectedCity.value] ?? null
));

const currentParties = computed(() => (
  (currentSeatData.value?.parties ?? [])
    .filter(({ seats }) => seats > 0)
    .map(({ name, seats, voteRate, color }) => {
      const meta = partyMeta[name] ?? {};
      const dotColor = color ?? FALLBACK_DOT_COLOR;
      const textColor = meta.textColor
        ?? (isLightColor(dotColor) ? darkenHex(dotColor, 0.3) : dotColor);

      return {
        key: name,
        label: meta.label ?? name,
        seats,
        voteRate,
        dotColor,
        textColor,
        chartOrder: meta.chartOrder ?? 60,
        legendOrder: meta.legendOrder ?? 6
      };
    })
));

const totalSeats = computed(() => (
  currentParties.value.reduce((total, party) => total + party.seats, 0)
));

const allocateByLargestRemainder = (total, weights) => {
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightTotal <= 0) return weights.map(() => 0);

  const exactValues = weights.map((weight) => (total * weight) / weightTotal);
  const values = exactValues.map(Math.floor);
  let remaining = total - values.reduce((sum, value) => sum + value, 0);

  exactValues
    .map((value, index) => ({ index, remainder: value - values[index] }))
    .sort((a, b) => b.remainder - a.remainder)
    .forEach(({ index }) => {
      if (remaining <= 0) return;
      values[index] += 1;
      remaining -= 1;
    });

  return values;
};

const buildSeatPositions = (seatCount) => {
  const centerX = 500;
  const centerY = 565;
  const radii = [235, 290, 345, 400, 455];
  const dotRadius = 16;
  const rowCounts = allocateByLargestRemainder(seatCount, radii);

  return radii
    .flatMap((radius, rowIndex) => {
      const seatsInRow = rowCounts[rowIndex];
      const edgeAngle = Math.asin((dotRadius + 7) / radius);
      const angleRange = Math.PI - (edgeAngle * 2);

      return Array.from({ length: seatsInRow }, (_, seatIndex) => {
        const progress = seatsInRow === 1 ? 0.5 : seatIndex / (seatsInRow - 1);
        const angle = Math.PI - edgeAngle - (angleRange * progress);

        return {
          x: centerX + (radius * Math.cos(angle)),
          y: centerY - (radius * Math.sin(angle)),
          radius: dotRadius,
          rowIndex,
          angle
        };
      });
    })
    .sort((a, b) => a.x - b.x || b.y - a.y);
};

const chartParties = computed(() => (
  [...currentParties.value].sort((a, b) => a.chartOrder - b.chartOrder)
));

const seatPoints = computed(() => {
  const seatParties = chartParties.value.flatMap((party) => (
    Array.from({ length: party.seats }, () => ({
      partyKey: party.key,
      color: party.dotColor
    }))
  ));

  return buildSeatPositions(totalSeats.value).map((seat, index) => ({
    ...seat,
    id: index,
    partyKey: seatParties[index].partyKey,
    color: seatParties[index].color
  }));
});

const legendParties = computed(() => (
  [...currentParties.value].sort((a, b) => a.legendOrder - b.legendOrder || b.seats - a.seats)
));

const hoveredPartyKey = ref(null);

const hoveredParty = computed(() => (
  currentParties.value.find((party) => party.key === hoveredPartyKey.value) ?? null
));

const chartAriaLabel = computed(() => {
  const partySummary = currentParties.value
    .map((party) => `${party.label} ${party.seats} 席`)
    .join('、');

  return `${selectedYear.value} 年${selectedCity.value}議員共 ${totalSeats.value} 席：${partySummary}`;
});

watch(selectedYear, () => {
  if (!cities.value.includes(selectedCity.value)) {
    selectedCity.value = cities.value[0];
  }
});

// 階段切換（SCHEDULE_START 跨過）時年份清單會變動，確保選取值仍有效
watch(years, (nextYears) => {
  if (!nextYears.includes(selectedYear.value)) {
    selectedYear.value = nextYears[0] ?? null;
  }
});

// 切換年份/縣市後點點重繪，mouseleave 不會觸發，需手動清除 hover 狀態
watch([selectedYear, selectedCity], () => {
  hoveredPartyKey.value = null;
});
</script>

<style scoped>
.seats-section {
  padding: 6rem 0 7rem;
  background: linear-gradient(
    to bottom,
    var(--color-coffee-0) 0px,
    var(--color-coffee-0) 300px,
    var(--color-coffee-0) 600px,
    var(--color-coffee-0) 100%
  );
}

@media (max-width: 768px) {
  .seats-section {
    background: linear-gradient(
      to bottom,
      var(--color-coffee-0) 0px,
      var(--color-coffee-0) 190px,
      var(--color-coffee-0) 380px,
      var(--color-coffee-0) 100%
    );
  }
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
  gap: 0rem;
  text-align: center;
}

.statistics-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.seats-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-coffee-900);
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 auto;
}

.seats-divider{
  width: 13rem;
  height: 2px;
  background-color: var(--color-coffee-300);
}

.section-subtitle{
    text-align: center;
    color: var(--color-coffee-300);
}

.seat_area {
  --seat-coffee: #917f6b;
  --seat-arrow: #8e6429;
  --seat-total: #000000;
  margin-top: 2.5rem;
}

.seat-filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1rem, 7vw, 4.5rem);
  width: min(100%, 27rem);
  margin: 0 auto;
}

.select-wrap {
  position: relative;
  min-width: 0;
}

.select-wrap select {
  width: 100%;
  min-width: 0;
  height: clamp(3.25rem, 6vw, 3.65rem);
  appearance: none;
  -webkit-appearance: none;
  border: 2px solid var(--seat-coffee);
  border-radius: 1.6rem;
  background: rgba(255, 255, 255, 0.12);
  color: var(--seat-coffee);
  padding: 0.35rem 3.75rem 0.35rem 1.25rem;
  font: inherit;
  font-size: clamp(1rem, 1.4vw, 1.2rem);
  font-weight: 700;
  line-height: 1;
  text-align: center;
  text-align-last: center;
  cursor: pointer;
}

.select-wrap select:focus-visible {
  outline: 3px solid rgba(142, 100, 41, 0.3);
  outline-offset: 3px;
}

.select-arrow {
  position: absolute;
  top: 50%;
  right: clamp(1.15rem, 3vw, 2.5rem);
  width: 0;
  height: 0;
  border-right: clamp(0.45rem, 0.9vw, 0.7rem) solid transparent;
  border-left: clamp(0.45rem, 0.9vw, 0.7rem) solid transparent;
  border-top: clamp(0.7rem, 1.4vw, 1.05rem) solid var(--seat-arrow);
  transform: translateY(-35%);
  pointer-events: none;
}

.seat-chart {
  width: 100%;
  margin: 0 auto;
}

.seat-chart-svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.seat-dot {
  transition: fill 0.25s ease, opacity 0.2s ease;
  cursor: pointer;
}

.seat-dot.is-dimmed {
  opacity: 0.3;
}

.seat-total {
  fill: var(--seat-total);
  font-family: inherit;
  font-size: 150px;
  font-weight: 300;
  line-height: 1;
  transition: fill 0.2s ease;
  pointer-events: none;
}

.seat-pending {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 18rem;
  margin-top: 1.5rem;
  color: #888888;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 300;
  letter-spacing: 0.35em;
  text-indent: 0.35em;
}

.seat-notes {
  margin-top: 1.35rem;
  color: #777b84;
  font-size: 0.78rem;
  line-height: 1.7;
  text-align: right;
}

.seat-empty {
  margin-top: 2.5rem;
  text-align: center;
  color: var(--color-coffee-600);
  font-size: 1.05rem;
}

.seat-legend {
  display: grid;
  grid-template-columns: repeat(var(--legend-columns), minmax(0, 1fr));
  align-items: center;
  width: 100%;
  margin-top: clamp(0.75rem, 2vw, 1.5rem);
  row-gap: 1.25rem;
}

.seat-legend li {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  gap: clamp(0.4rem, 1vw, 0.75rem);
  font-size: clamp(0.95rem, 2.45vw, 1.75rem);
  font-weight: 400;
  line-height: 1.2;
  white-space: nowrap;
}

.legend-square {
  width: clamp(0.65rem, 1.7vw, 1.15rem);
  height: clamp(0.65rem, 1.7vw, 1.15rem);
  flex: 0 0 auto;
}

@media (max-width: 768px) {
  .section-header {
    margin-bottom: 2.5rem;
  }

  .seat_area {
    margin-top: 1.75rem;
  }

  .seat-filters {
    gap: 1rem;
  }

  .select-wrap select {
    padding-right: 2.75rem;
  }

  .seat-chart {
    width: 108%;
    margin-top: 2.5rem;
    margin-left: -4%;
  }

  .seat-legend {
    width: 100%;
    margin-left: 0;
    row-gap: 0.85rem;
  }
}

@media (max-width: 420px) {
  .select-wrap select {
    height: 3.15rem;
    border-radius: 1.3rem;
    padding-right: 2.35rem;
    padding-left: 0.75rem;
  }

  .select-arrow {
    right: 0.95rem;
  }

  .seat-legend {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

</style>
