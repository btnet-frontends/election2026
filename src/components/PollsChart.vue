<template>
  <section id="polls" class="polls-section" :style="{ backgroundImage: `url(${pollsBg})` }">
    <div class="container">
      <div class="section-header">
        <span class="polls-title">
          <img :src="searchIcon" alt="search" class="search-icon" />
          選舉民調
        </span>
        <div class="polls-divider"></div>
      </div>

      <div class="polls-card">
        <div class="polls-tabs-wrapper">
          <div class="polls-tabs">
            <button 
              v-for="tab in chartTabs" 
              :key="tab.id"
              :class="['tab-btn', { 'active': activeTab === tab.id }]"
              @click="switchTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="chart-content" :style="{ minHeight: iframeHeight }">
          <transition name="fade">
            <div v-if="isLoading" class="chart-skeleton">
              <div class="skeleton-header">
                <div class="pulse-line sm"></div>
                <div class="pulse-line md"></div>
              </div>
            </div>
          </transition>

          <div class="flourish-container" :class="{ 'hidden': isLoading }">
            <iframe 
              ref="iframeRef"
              :key="activeTab"
              :src="currentChartUrl" 
              class="flourish-iframe"
              frameborder="0" 
              scrolling="no" 
              :style="{ height: iframeHeight }"
              @load="onIframeLoad"
            ></iframe>
          </div>
        </div>

        <div class="chart-footer">
          <span class="footer-source">* 資料來源：</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue';
import pollsBg from '../assets/images/polls_bg.png?url';
import searchIcon from '../assets/images/search_icon.svg?url';
import config from '../json/data.json';

const chartTabs = config.pollsChart.tabs;
const defaultIframeHeight = '500px';

const activeTab = ref(chartTabs[0]?.id || '');
const isLoading = ref(true);
const iframeRef = ref(null);
const iframeHeight = ref(defaultIframeHeight);

const currentChartUrl = computed(() => {
  const activeItem = chartTabs.find(tab => tab.id === activeTab.value) || chartTabs[0];
  if (!activeItem) return '';

  return `https://public.flourish.studio/visualisation/${activeItem.flourishId}/embed?auto=1`;
});

const switchTab = (tabId) => {
  if (activeTab.value === tabId) return;
  isLoading.value = true; 
  iframeHeight.value = defaultIframeHeight;
  activeTab.value = tabId;
};

const onIframeLoad = () => {
  isLoading.value = false;
};

const parseMessageData = (messageData) => {
  if (typeof messageData === 'object' && messageData !== null) return messageData;

  try {
    return JSON.parse(messageData);
  } catch {
    return null;
  }
};

const normalizeIframeHeight = (height) => {
  if (typeof height === 'number' && Number.isFinite(height)) {
    return `${Math.ceil(height)}px`;
  }

  if (typeof height !== 'string') return null;

  const trimmedHeight = height.trim();

  if (/^\d+(\.\d+)?$/.test(trimmedHeight)) {
    return `${Math.ceil(Number(trimmedHeight))}px`;
  }

  if (/^\d+(\.\d+)?(cm|mm|Q|in|pc|pt|px|em|ex|ch|rem|lh|vw|vh|vmin|vmax|%)$/i.test(trimmedHeight)) {
    return trimmedHeight;
  }

  return null;
};

const isFlourishOrigin = (origin) => {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === 'flourish.studio' ||
      hostname.endsWith('.flourish.studio') ||
      hostname === 'uri.sh' ||
      hostname.endsWith('.uri.sh');
  } catch {
    return false;
  }
};

const isCurrentIframeMessage = (source, iframe) => {
  if (source === iframe.contentWindow) return true;

  try {
    return source?.parent === iframe.contentWindow;
  } catch {
    return false;
  }
};

const onFlourishMessage = (event) => {
  const iframe = iframeRef.value;
  if (!iframe || !isCurrentIframeMessage(event.source, iframe) || !isFlourishOrigin(event.origin)) return;

  const data = parseMessageData(event.data);
  if (data?.sender !== 'Flourish' || data.method !== 'resize') return;

  const nextHeight = normalizeIframeHeight(data.height);
  if (nextHeight) {
    iframeHeight.value = nextHeight;
  }
};

onMounted(() => {
  window.addEventListener('message', onFlourishMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', onFlourishMessage);
});
</script>

<style scoped>
.polls-section {
  padding: 6rem 0;
  background-color: var(--color-coffee-50); 
  background-attachment: fixed;
  background-position: bottom center;
  background-repeat: no-repeat;
  background-size: cover;
}

.container {
  position: relative;
  z-index: 1;
}

.section-header {
  margin-bottom: 3.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.search-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.polls-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-coffee-900);
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.polls-divider {
  flex: 1;
  height: 1.5px;
  background: var(--color-coffee-300);
}

.polls-card {
  background: var(--color-coffee-0);
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.04), 0 8px 10px -6px rgb(0 0 0 / 0.04);
  overflow: hidden;
  padding: 2.5rem;
}

.polls-tabs-wrapper {
  
  display: flex;
  justify-content: center;
  margin-bottom: 2.5rem;
}

.polls-tabs {
  display: inline-flex;
  background: var(--color-coffee-50);
  padding: 0.4rem;
  border-radius: 14px;
  border: 1px solid var(--color-coffee-200);
}

.tab-btn {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-coffee-600);
  padding: 0.6rem 1.8rem;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-btn:hover {
  color: var(--color-primary);
}

.tab-btn.active {
  background: var(--color-coffee-0);
  color: var(--color-primary);
  font-weight: 700;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.chart-content {
  position: relative;
  width: 100%;
}

.flourish-container {
  width: 100%;
  height: 100%;
  transition: opacity 0.5s ease;
  opacity: 1;
}

.flourish-container.hidden {
  opacity: 0;
  pointer-events: none;
  position: absolute;
}

.flourish-iframe {
  width: 100%;
  min-height: 320px;
  border: none;
  background: transparent;
}

.chart-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-coffee-0);
  z-index: 5;
}

.skeleton-header {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.pulse-line {
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loadingPulse 1.5s infinite;
}

.pulse-line.sm { width: 120px; }
.pulse-line.md { width: 220px; }

.chart-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-coffee-150);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: var(--color-coffee-600);
}

.footer-source {
  font-weight: 600;
}

@keyframes loadingPulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 991px) {
  .polls-card {
    padding: 1.5rem;
  }
  
  .tab-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  
  .chart-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .polls-tabs-wrapper {
    width: 100%;
    overflow-x: auto;
    justify-content: center;
    padding: 4px 2px;
    scrollbar-width: none;
  }

  .polls-tabs-wrapper::-webkit-scrollbar {
    display: none;
  }

  .polls-tabs {
    flex-shrink: 0;
  }
}
</style>
