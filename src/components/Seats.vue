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

      <div class="seat_area">
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
              :cx="seat.x"
              :cy="seat.y"
              :r="seat.radius"
              :fill="seat.color"
              :data-party="seat.partyKey"
              aria-hidden="true"
            />

            <text
              class="seat-total"
              x="500"
              y="535"
              text-anchor="middle"
              aria-hidden="true"
            >
              {{ totalSeats }}
            </text>
          </svg>
        </div>

        <ul
          class="seat-legend"
          :style="{ '--legend-columns': Math.min(currentParties.length, 3) }"
          aria-label="政黨席次比例"
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
            <span>{{ party.label }}：{{ party.percentage }}%</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import statisticsIcon from '../assets/images/statistics_icon.svg?url';

const partyCatalog = {
  independent: {
    key: 'independent',
    label: '無黨',
    dotColor: '#dedede',
    textColor: '#888888',
    chartOrder: 50,
    legendOrder: 1
  },
  kmt: {
    key: 'kmt',
    label: '國民黨',
    dotColor: '#3498db',
    textColor: '#3498db',
    chartOrder: 10,
    legendOrder: 2
  },
  dpp: {
    key: 'dpp',
    label: '民進黨',
    dotColor: '#59e84f',
    textColor: '#59e84f',
    chartOrder: 100,
    legendOrder: 3
  },
  tpp: {
    key: 'tpp',
    label: '民眾黨',
    dotColor: '#55c9d2',
    textColor: '#31aab4',
    chartOrder: 30,
    legendOrder: 4
  },
  npp: {
    key: 'npp',
    label: '時代力量',
    dotColor: '#f3cf37',
    textColor: '#bd9600',
    chartOrder: 40,
    legendOrder: 5
  },
  sdp: {
    key: 'sdp',
    label: '社民黨',
    dotColor: '#ee729b',
    textColor: '#d9507d',
    chartOrder: 60,
    legendOrder: 6
  },
  green: {
    key: 'green',
    label: '台灣綠黨',
    dotColor: '#7cb342',
    textColor: '#62942f',
    chartOrder: 60,
    legendOrder: 6
  },
  tsp: {
    key: 'tsp',
    label: '台灣基進',
    dotColor: '#a960a8',
    textColor: '#914b99',
    chartOrder: 70,
    legendOrder: 5
  }
};

// 2026 尚未有正式開票結果；此處只用來展示動態席次功能。
// 正式資料接入後只需替換各城市的 parties 陣列。
const demoSeatsByYear = {
  2026: {
    台北市: {
      parties: [
        { key: 'independent', seats: 10 },
        { key: 'kmt', seats: 25 },
        { key: 'dpp', seats: 21 },
        { key: 'tpp', seats: 4 },
        { key: 'sdp', seats: 1 }
      ]
    },
    新北市: {
      parties: [
        { key: 'independent', seats: 8 },
        { key: 'kmt', seats: 29 },
        { key: 'dpp', seats: 25 },
        { key: 'tpp', seats: 5 },
        { key: 'npp', seats: 1 }
      ]
    },
    桃園市: {
      parties: [
        { key: 'independent', seats: 10 },
        { key: 'kmt', seats: 26 },
        { key: 'dpp', seats: 23 },
        { key: 'tpp', seats: 5 },
        { key: 'green', seats: 1 }
      ]
    },
    台中市: {
      parties: [
        { key: 'independent', seats: 9 },
        { key: 'kmt', seats: 29 },
        { key: 'dpp', seats: 24 },
        { key: 'tpp', seats: 2 },
        { key: 'tsp', seats: 1 }
      ]
    },
    台南市: {
      parties: [
        { key: 'independent', seats: 14 },
        { key: 'kmt', seats: 15 },
        { key: 'dpp', seats: 26 },
        { key: 'tsp', seats: 2 }
      ]
    },
    高雄市: {
      parties: [
        { key: 'independent', seats: 9 },
        { key: 'kmt', seats: 21 },
        { key: 'dpp', seats: 29 },
        { key: 'tpp', seats: 3 },
        { key: 'tsp', seats: 2 },
        { key: 'npp', seats: 1 }
      ]
    }
  }
};

const years = Object.keys(demoSeatsByYear)
  .map(Number)
  .sort((a, b) => b - a);
const selectedYear = ref(years[0]);
const cities = computed(() => Object.keys(demoSeatsByYear[selectedYear.value] ?? {}));
const selectedCity = ref(cities.value[0]);

const currentSeatData = computed(() => (
  demoSeatsByYear[selectedYear.value]?.[selectedCity.value]
  ?? demoSeatsByYear[years[0]][Object.keys(demoSeatsByYear[years[0]])[0]]
));

const currentParties = computed(() => (
  currentSeatData.value.parties
    .filter(({ key, seats }) => partyCatalog[key] && seats > 0)
    .map(({ key, seats }) => ({
      ...partyCatalog[key],
      seats
    }))
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

const legendParties = computed(() => {
  const percentages = allocateByLargestRemainder(
    100,
    currentParties.value.map((party) => party.seats)
  );

  return currentParties.value
    .map((party, index) => ({
      ...party,
      percentage: percentages[index]
    }))
    .sort((a, b) => a.legendOrder - b.legendOrder);
});

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
</script>

<style scoped>
.seats-section {
  padding: 2rem 0 7rem;
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
  --seat-total: #888888;
  margin-top: 2.5rem;
}

.seat-filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1rem, 7vw, 4.5rem);
  width: min(100%, 30rem);
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
  border: 2px solid #171717;
  border-radius: 1.6rem;
  background: rgba(255, 255, 255, 0.12);
  color: var(--seat-coffee);
  padding: 0.35rem 3.75rem 0.35rem 1.25rem;
  font: inherit;
  font-size: clamp(1.25rem, 2.6vw, 1.8rem);
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
  transition: fill 0.25s ease;
}

.seat-total {
  fill: var(--seat-total);
  font-family: inherit;
  font-size: 180px;
  font-weight: 300;
  line-height: 1;
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
