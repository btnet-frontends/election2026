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
<div class="polls-tabs-wrapper" v-show="false">
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

        <div class="chart-content">
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
              :key="activeTab"
              :src="currentChartUrl" 
              class="flourish-iframe"
              frameborder="0" 
              scrolling="no" 
              style="width: 100%; height: 500px;"
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
import { ref, computed } from 'vue';
import pollsBg from '../assets/images/polls_bg.png?url';
import searchIcon from '../assets/images/search_icon.svg?url';
import config from '../json/data.json';

const chartTabs = config.pollsChart.tabs;

const activeTab = ref('history');
const isLoading = ref(true);

const currentChartUrl = computed(() => {
  const activeItem = chartTabs.find(tab => tab.id === activeTab.value);
  return `https://public.flourish.studio/visualisation/${activeItem.flourishId}/embed?auto=1`;
});

const switchTab = (tabId) => {
  if (activeTab.value === tabId) return;
  isLoading.value = true; 
  activeTab.value = tabId;
};

const onIframeLoad = (event) => {
  if (event.target.src === currentChartUrl.value) {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.polls-section {
  padding: 6rem 0;
  background-color: var(--color-bg-warm); 
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
  color: var(--color-text-main);
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
  background: var(--color-bg-pure);
  border-radius: 24px;
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: var(--shadow-premium);
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
  background: var(--color-bg-warm);
  padding: 0.4rem;
  border-radius: 14px;
  border: 1px solid var(--color-border);
}

.tab-btn {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 0.6rem 1.8rem;
  border-radius: 10px;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--color-primary);
}

.tab-btn.active {
  background: var(--color-bg-pure);
  color: var(--color-primary);
  font-weight: 700;
  box-shadow: var(--shadow-sm);
}

.chart-content {
  position: relative;
  min-height: 480px;
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
  height: 500px;
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
  background: var(--color-bg-pure);
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
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: var(--color-text-muted);
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