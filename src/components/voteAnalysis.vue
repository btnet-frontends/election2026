<template>
  <section id="vote-analysis" class="vote-analysis-section">
    <div class="container vote-analysis-container">
      <header class="section-heading">
        <h2>• {{ voteAnalysis.title }} •</h2>
      </header>

      <div
        class="chart-tabs"
        role="tablist"
        :aria-label="`${voteAnalysis.title}圖表`"
        aria-orientation="horizontal"
      >
        <button
          v-for="(tab, index) in tabs"
          :id="`vote-analysis-tab-${tab.id}`"
          :key="tab.id"
          class="chart-tab"
          :class="{ active: tab.id === activeTabId }"
          type="button"
          role="tab"
          :aria-selected="tab.id === activeTabId"
          :aria-controls="`vote-analysis-panel-${tab.id}`"
          :tabindex="tab.id === activeTabId ? 0 : -1"
          @click="activateTab(tab.id)"
          @keydown="handleTabKeydown($event, index)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div
        v-if="activeTab"
        :id="`vote-analysis-panel-${activeTab.id}`"
        class="chart-panel"
        role="tabpanel"
        :aria-labelledby="`vote-analysis-tab-${activeTab.id}`"
        tabindex="0"
      >
        <div v-if="activeTab.type === 'line'" class="line-chart-wrap">
          <p id="party-trend-swipe-hint" class="chart-swipe-hint">
            <span class="swipe-hint-icon" aria-hidden="true">↔</span>
            左右滑動查看完整圖表
          </p>
          <div
            class="chart-scroll"
            tabindex="0"
            aria-describedby="party-trend-swipe-hint"
          >
            <VChart
              class="echart line-chart"
              :option="lineOption"
              :init-options="chartInitOptions"
              autoresize
              role="img"
              :aria-label="activeTab.label"
            />
          </div>
        </div>

        <VChart
          v-else-if="activeTab.type === 'bar'"
          class="echart turnout-chart"
          :option="turnoutOption"
          :init-options="chartInitOptions"
          autoresize
          role="img"
          :aria-label="activeTab.label"
        />

        <VChart
          v-else
          :key="activeTab.id"
          class="echart municipality-chart"
          :option="municipalityOption"
          :init-options="chartInitOptions"
          autoresize
          role="img"
          :aria-label="activeTab.label"
        />
      </div>

      <p class="source-note">
        <a :href="voteAnalysis.source.url" target="_blank" rel="noopener noreferrer">
          {{ voteAnalysis.source.label }}
        </a>
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  AriaComponent,
  GridComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import { LabelLayout } from 'echarts/features';
import VChart from 'vue-echarts';
import config from '../json/data.json';

use([
  SVGRenderer,
  BarChart,
  LineChart,
  PieChart,
  AriaComponent,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LabelLayout
]);

const voteAnalysis = config.voteAnalysis;
const tabs = voteAnalysis.tabs;
const colors = voteAnalysis.colors;
const fontFamily = "'Inter', 'Noto Sans TC', sans-serif";
const chartInitOptions = Object.freeze({ renderer: 'svg' });

const activeTabId = ref(tabs[0]?.id ?? '');

const activeTab = computed(() => (
  tabs.find((tab) => tab.id === activeTabId.value) ?? tabs[0]
));

const activeMunicipalityData = computed(() => (
  voteAnalysis.municipality.years[String(activeTab.value?.year)] ?? []
));

const activateTab = (tabId) => {
  activeTabId.value = tabId;
};

const handleTabKeydown = (event, currentIndex) => {
  const tabElements = Array.from(
    event.currentTarget.closest('[role="tablist"]')?.querySelectorAll('[role="tab"]') ?? []
  );
  if (!tabElements.length) return;

  let nextIndex = currentIndex;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = (currentIndex + 1) % tabs.length;
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  } else if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = tabs.length - 1;
  } else {
    return;
  }

  event.preventDefault();
  activateTab(tabs[nextIndex].id);
  tabElements[nextIndex]?.focus();
};

const formatPercentage = (value) => {
  const numericValue = Number(value);
  return Number.isInteger(numericValue)
    ? numericValue.toFixed(0)
    : numericValue.toFixed(2).replace(/0$/, '');
};

const tooltipBase = {
  backgroundColor: 'rgba(45, 43, 48, 0.94)',
  borderWidth: 0,
  padding: [10, 12],
  textStyle: {
    color: '#ffffff',
    fontFamily,
    fontSize: 14
  },
  extraCssText: 'border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.18);'
};

const lineOption = computed(() => {
  const categoryLabels = voteAnalysis.partyTrend.categories.map(
    ({ year, election }) => `${year}\n${election}`
  );

  return {
    animationDuration: 550,
    color: [colors.kmt, colors.dpp],
    aria: {
      enabled: true,
      description: '比較國民黨與民進黨自2002年至2022年重要選舉得票率。'
    },
    title: {
      text: voteAnalysis.partyTrend.axisTitle,
      left: 4,
      top: 3,
      textStyle: {
        color: '#444444',
        fontFamily,
        fontSize: 17,
        fontWeight: 700
      }
    },
    tooltip: {
      ...tooltipBase,
      trigger: 'axis',
      confine: true,
      axisPointer: {
        type: 'line',
        lineStyle: { color: colors.accent, type: 'dashed', opacity: 0.5 }
      },
      formatter: (params) => {
        const points = Array.isArray(params) ? params : [params];
        const category = voteAnalysis.partyTrend.categories[points[0]?.dataIndex];
        const heading = category ? `${category.year} ${category.election.replace('\n', '')}` : '';
        const rows = points.map((point) => (
          `${point.marker}${point.seriesName}：<strong>${formatPercentage(point.value)}%</strong>`
        ));
        return [heading, ...rows].join('<br>');
      }
    },
    grid: {
      left: 62,
      right: 28,
      top: 62,
      bottom: 110,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: categoryLabels,
      axisLine: { lineStyle: { color: '#9197a1' } },
      axisTick: { alignWithLabel: true, length: 5 },
      axisLabel: {
        interval: 0,
        color: colors.text,
        fontFamily,
        fontSize: 12,
        lineHeight: 16,
        margin: 18,
        hideOverlap: false
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 60,
      interval: 10,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: colors.text,
        fontFamily,
        fontSize: 12
      },
      splitLine: { lineStyle: { color: colors.grid } }
    },
    series: voteAnalysis.partyTrend.series.map((series, index) => {
      const seriesColor = colors[series.id];
      return {
        id: series.id,
        name: series.name,
        type: 'line',
        data: series.values,
        smooth: false,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 12,
        z: index === 0 ? 3 : 2,
        lineStyle: { color: seriesColor, width: 2 },
        itemStyle: {
          color: '#ffffff',
          borderColor: seriesColor,
          borderWidth: 2
        },
        areaStyle: { color: seriesColor, opacity: 0.45 },
        emphasis: { focus: 'series', scale: 1.25 }
      };
    })
  };
});

const turnoutOption = computed(() => {
  const items = voteAnalysis.turnout.items;

  return {
    animationDuration: 550,
    aria: {
      enabled: true,
      description: '比較2008年至2022年台灣重要選舉投票率。'
    },
    tooltip: {
      ...tooltipBase,
      trigger: 'axis',
      confine: true,
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(100,56,81,.08)' } },
      formatter: (params) => {
        const point = Array.isArray(params) ? params[0] : params;
        return `${point.name}<br>${point.marker}投票率：<strong>${formatPercentage(point.value)}%</strong>`;
      }
    },
    grid: {
      left: 128,
      right: 58,
      top: 18,
      bottom: 48,
      containLabel: false
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 80,
      interval: 20,
      name: `(${voteAnalysis.turnout.unit})`,
      nameLocation: 'end',
      nameGap: 16,
      nameTextStyle: { color: colors.text, fontFamily, fontSize: 13 },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: colors.text, fontFamily, fontSize: 12 },
      splitLine: { lineStyle: { color: colors.grid } }
    },
    yAxis: {
      type: 'category',
      data: items.map((item) => item.label),
      axisLine: { lineStyle: { color: '#9197a1' } },
      axisTick: { show: false },
      axisLabel: {
        color: colors.text,
        fontFamily,
        fontSize: 12,
        margin: 10
      }
    },
    series: [
      {
        name: '投票率',
        type: 'bar',
        data: items.map((item) => item.value),
        barWidth: '76%',
        itemStyle: { color: colors.turnout },
        emphasis: { itemStyle: { color: colors.accent } }
      }
    ]
  };
});

const getPieData = (city) => {
  const partyLabels = voteAnalysis.municipality.partyLabels;
  return [
    { key: 'kmt', name: `${partyLabels.kmt}(%)`, value: city.kmt },
    { key: 'dpp', name: `${partyLabels.dpp}(%)`, value: city.dpp },
    { key: 'other', name: `${partyLabels.other}(%)`, value: city.other }
  ];
};

const compactPieLabel = ({ data: item }) => (
  item.key === 'other' ? '其他候選人(%)' : item.name
);

const buildPieSeries = (cities, positions, radius, compact = false) => (
  cities.flatMap((city, index) => [
    {
      id: city.city,
      name: `${activeTab.value.year}年${city.city}`,
      type: 'pie',
      radius,
      center: positions[index],
      minAngle: 0,
      avoidLabelOverlap: true,
      itemStyle: { borderWidth: 0 },
      label: {
        show: true,
        color: '#454545',
        fontFamily,
        fontSize: compact ? 11 : 12,
        formatter: compact ? compactPieLabel : '{b}',
        bleedMargin: 0
      },
      labelLine: {
        show: true,
        length: compact ? 8 : 12,
        length2: compact ? 6 : 10,
        lineStyle: { width: 1 }
      },
      emphasis: {
        scale: true,
        scaleSize: 7,
        label: { fontWeight: 700 }
      },
      data: getPieData(city)
    },
    {
      id: `${city.city}-center-label`,
      name: `${city.city}地名`,
      type: 'pie',
      radius: [0, 1],
      center: positions[index],
      silent: true,
      animation: false,
      z: 20,
      tooltip: { show: false },
      labelLine: { show: false },
      label: {
        show: true,
        position: 'center',
        formatter: city.city,
        color: colors.text,
        fontFamily,
        fontSize: compact ? 15 : 16,
        fontWeight: 700
      },
      data: [
        {
          value: 1,
          itemStyle: { color: 'transparent' },
          emphasis: { disabled: true }
        }
      ]
    }
  ])
);

const municipalityOption = computed(() => {
  const cities = activeMunicipalityData.value;
  const desktopPositions = [
    ['22%', '25%'], ['50%', '25%'], ['78%', '25%'],
    ['22%', '75%'], ['50%', '75%'], ['78%', '75%']
  ];
  const tabletPositions = [
    ['25%', '16.5%'], ['75%', '16.5%'],
    ['25%', '50%'], ['75%', '50%'],
    ['25%', '83.5%'], ['75%', '83.5%']
  ];
  const mobilePositions = cities.map((_, index) => [
    '50%', `${((index + 0.5) / cities.length) * 100}%`
  ]);

  return {
    baseOption: {
      animationDuration: 550,
      color: [colors.kmt, colors.dpp, colors.other],
      aria: {
        enabled: true,
        description: cities.map(getPieAriaLabel).join(' ')
      },
      tooltip: {
        ...tooltipBase,
        trigger: 'item',
        confine: true,
        formatter: (params) => (
          `${params.seriesName}<br>${params.marker}${params.name}：<strong>${formatPercentage(params.value)}%</strong>`
        )
      },
      series: buildPieSeries(cities, desktopPositions, ['22%', '35%'])
    },
    media: [
      {
        query: { maxWidth: 991 },
        option: {
          series: buildPieSeries(cities, tabletPositions, [52, 86], true)
        }
      },
      {
        query: { maxWidth: 700 },
        option: {
          series: buildPieSeries(cities, mobilePositions, [48, 80], true)
        }
      }
    ]
  };
});

function getPieAriaLabel(city) {
  const partyLabels = voteAnalysis.municipality.partyLabels;
  return `${activeTab.value.year}年${city.city}：${partyLabels.kmt} ${formatPercentage(city.kmt)}%、${partyLabels.dpp} ${formatPercentage(city.dpp)}%、${partyLabels.other} ${formatPercentage(city.other)}%。`;
}
</script>

<style scoped>
.vote-analysis-section {  
    padding: 6rem 0;
  background-color: var(--color-coffee-50); 
  background-attachment: fixed;
  background-position: bottom center;
  background-repeat: no-repeat;
  background-size: cover;
}

.vote-analysis-container {
  position: relative;
  z-index: 1;
  max-width: 1380px;
}

.section-heading {
  margin-bottom: 2.5rem;
  text-align: center;
  color: var(--color-coffee-300);
}

.chart-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.5rem;
  width: min(100%, 1120px);
  margin: 0 auto 3.75rem;
}

.chart-tab {
  display: flex;
  min-width: 0;
  min-height: 3.55rem;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-coffee-accent);
  border-radius: 999px;
  padding: 0.65rem 1.5rem;
  background: #ffffff;
  color: var(--color-coffee-accent);
  font-size: clamp(0.9rem, 1.25vw, 1.1rem);
  font-weight: 500;
  line-height: 1.35;
  text-align: center;
  transition: background-color 180ms ease, color 180ms ease, transform 180ms ease;
}

.chart-tab:hover {
  background: #f6eef2;
}

.chart-tab:active {
  transform: translateY(1px);
}

.chart-tab.active {
  background: var(--color-coffee-accent);
  color: #ffffff;
}

.chart-tab:focus-visible,
.chart-panel:focus-visible,
.chart-scroll:focus-visible {
  outline: 3px solid rgba(142,95,40, 0.28);
  outline-offset: 4px;
}

.chart-panel {
  width: 100%;
  min-height: 32rem;
  border-radius: 0.75rem;
}

.chart-scroll {
  width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scrollbar-color: rgba(142,95,40, 0.38) transparent;
  -webkit-overflow-scrolling: touch;
}

.chart-swipe-hint {
  display: none;
}

.echart {
  width: 100%;
}

.line-chart {
  min-width: 980px;
  height: 34rem;
}

.turnout-chart {
  height: 35rem;
}

.municipality-chart {
  height: 37rem;
}

.source-note {
  margin-top: 1.35rem;
  color: #777b84;
  font-size: 0.78rem;
  text-align: right;
}

.source-note a {
  border-bottom: 1px solid transparent;
}

.source-note a:hover,
.source-note a:focus-visible {
  border-bottom-color: currentColor;
}

@media (max-width: 991px) {
  .vote-analysis-container {
    max-width: 960px;
  }

  .chart-tabs {
    margin-bottom: 2.75rem;
  }

  .municipality-chart {
    height: 54rem;
  }
}

@media (max-width: 700px) {
  .vote-analysis-section {
    padding: 1.5rem 0 5rem;
  }

  .section-heading {
    margin-bottom: 1.75rem;
  }

  .chart-tabs {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    width: min(100%, 34rem);
    margin-bottom: 2.25rem;
  }

  .chart-tab {
    min-height: 3rem;
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .chart-panel {
    min-height: 31rem;
  }

  .chart-swipe-hint {
    display: flex;
    width: fit-content;
    align-items: center;
    gap: 0.45rem;
    margin: 0 auto 0.25rem;
    border-radius: 999px;
    padding: 0.35rem 0.8rem;
    background: rgba(142, 95, 40, 0.1);
    color: var(--color-coffee-accent);
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .swipe-hint-icon {
    display: inline-block;
    font-size: 1rem;
    animation: swipe-hint 1.4s ease-in-out infinite;
  }

  .line-chart {
    height: 31rem;
  }

  .turnout-chart {
    height: 38rem;
  }

  .municipality-chart {
    height: 105rem;
  }

  .source-note {
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chart-tab,
  .swipe-hint-icon {
    transition: none;
    animation: none;
  }
}

@keyframes swipe-hint {
  0%, 100% { transform: translateX(-2px); }
  50% { transform: translateX(2px); }
}
</style>
