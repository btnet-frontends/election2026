<template>
  <div class="flash-news-bar container">
    <div class="flash-outer">
      <div class="flash-container">
        <div class="flash-badge">快訊</div>

<div class="flash-content-wrapper desktop-only">
  <div :class="['ticker-item', animClass]">
    <a class="ticker-text" :href="currentNews.link" target="_blank" rel="noopener noreferrer">
      {{ currentNews.text }}
    </a>
    <span class="ticker-date">{{ currentNews.date }}</span>
  </div>
</div>

        <div class="flash-content-mobile mobile-only">
          <div class="marquee-track">
            <div class="marquee-content" @animationiteration="refreshFlashNews">
              <span v-for="(item, idx) in flashItems" :key="idx" class="marquee-item" @click="openLink(item.link)">
                <span class="marquee-text">{{ item.text }}</span>
                <span class="marquee-divider">/</span>
              </span>
              <span v-for="(item, idx) in flashItems" :key="'dup-' + idx" class="marquee-item" @click="openLink(item.link)">
                <span class="marquee-text">{{ item.text }}</span>
                <span class="marquee-divider">/</span>
              </span>
            </div>
          </div>
        </div>

        <div class="flash-controls desktop-only">
          <button class="control-btn prev" @click="prevNews" aria-label="Previous News">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
            </svg>
          </button>
          <button class="control-btn next" @click="nextNews" aria-label="Next News">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { buildNewsApiUrl } from '../utils/newsApi.js';
import { buildFlashNewsList } from '../utils/newsUtils.js';

const props = defineProps({
  flashNewsList: {
    type: Array,
    required: true
  },
  flashNewsApi: {
    type: Object,
    default: null
  }
});

const flashItems = ref(props.flashNewsList);
const currentIndex = ref(0);
const direction = ref('down');
const animClass = ref('');
const isRefreshing = ref(false);
let autoPlayTimer = null;

const currentNews = computed(() => flashItems.value[currentIndex.value] ?? {});

const openLink = (url) => {
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
};

const refreshFlashNews = async () => {
  const api = props.flashNewsApi;
  if (!api?.tagName || isRefreshing.value) return;

  isRefreshing.value = true;

  try {
    const response = await fetch(buildNewsApiUrl(api), { cache: 'no-store' });
    if (!response.ok) throw new Error(`快訊 API 回應失敗: ${response.status}`);

    const data = await response.json();
    const nextItems = buildFlashNewsList(data.article_lists, api.limit || 4);

    if (nextItems.length > 0) {
      flashItems.value = nextItems;
      currentIndex.value = Math.min(currentIndex.value, nextItems.length - 1);
    }
  } catch (error) {
    console.error('更新快訊失敗:', error);
  } finally {
    isRefreshing.value = false;
  }
};

const changeNews = (newIndex, shouldRefresh = true) => {
  const itemCount = flashItems.value.length;
  if (itemCount === 0) return;

  const safeIndex = (newIndex + itemCount) % itemCount;
  const outClass = direction.value === 'down' ? 'slide-out-up' : 'slide-out-down';
  const inClass = direction.value === 'down' ? 'slide-in-down' : 'slide-in-up';
  animClass.value = outClass;
  setTimeout(() => {
    currentIndex.value = safeIndex;
    animClass.value = inClass;
    setTimeout(() => {
      animClass.value = '';
    }, 350);
    if (shouldRefresh) {
      refreshFlashNews();
    }
  }, 350);
};

const rotateNews = () => {
  if (flashItems.value.length <= 1) {
    refreshFlashNews();
    return;
  }

  direction.value = 'down';
  changeNews(currentIndex.value + 1);
};

const nextNews = () => {
  if (flashItems.value.length <= 1) {
    refreshFlashNews();
    resetTimer();
    return;
  }

  direction.value = 'down';
  changeNews(currentIndex.value + 1);
  resetTimer();
};

const prevNews = () => {
  if (flashItems.value.length <= 1) {
    refreshFlashNews();
    resetTimer();
    return;
  }

  direction.value = 'up';
  changeNews(currentIndex.value - 1);
  resetTimer();
};

const startTimer = () => {
  autoPlayTimer = setInterval(() => {
    rotateNews();
  }, 4500);
};

const resetTimer = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
    startTimer();
  }
};

onMounted(() => startTimer());
onUnmounted(() => { if (autoPlayTimer) clearInterval(autoPlayTimer); });
</script>

<style scoped>
.flash-news-bar {
  margin-top: 4rem;
  margin-bottom: 3.5rem;
  position: relative;
  z-index: 10;
}

.flash-outer {
  padding: 1.5px;
  border-radius: 50px;
  background: linear-gradient(90deg, #7CFFB0 0%, #29D9CA 40%, #227EFF 100%);
  box-sizing: border-box;
}

.flash-container {
  display: flex;
  align-items: stretch;
  background: #ffffff;
  border-radius: calc(50px - 1.5px);
  height: 56px;
  overflow: hidden;
  box-sizing: border-box;
}

.flash-badge {
  background: linear-gradient(160deg, #7CFFB0 0%, #29D9CA 40%, #227EFF 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 1.5rem;
  padding: 0 1.5rem;
  border-radius: calc(50px - 1.5px) 0 0 calc(50px - 1.5px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.08em;
  flex-shrink: 0;
  align-self: stretch;
}

.flash-content-wrapper {
flex: 1;
  min-width: 0;
  padding: 0 1.5rem;
  overflow: hidden;
  height: 100%;
  display: flex;
  align-items: center;
}

.ticker-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  width: 100%;
}

.ticker-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-coffee-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  display: block;
  min-width: 0;
}

.ticker-text:hover {
  color: var(--color-coffee-600);
}

.ticker-date {
  font-family: 'Outfit', 'Noto Sans TC', sans-serif;
  font-size: 0.95rem;
  color: #917F6B;
  font-weight: 600;
  white-space: nowrap;
}

.flash-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border-left: 1px solid var(--color-coffee-200);
  padding: 0 0.75rem;
  flex-shrink: 0;
  align-self: center;
  height: 55%;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #CBC1B5;
  background-color: #F1EAE3;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-btn svg {
  width: 20px;
  height: 20px;
}

.control-btn:hover {
  background-color: #e8dfd7;
  color: #a09890;
}

.slide-out-up {
  animation: slideOutUp 0.35s cubic-bezier(0.55, 0, 0.1, 1) forwards;
}

.slide-out-down {
  animation: slideOutDown 0.35s cubic-bezier(0.55, 0, 0.1, 1) forwards;
}

.slide-in-down {
  animation: slideInDown 0.35s cubic-bezier(0.55, 0, 0.1, 1) forwards;
}

.slide-in-up {
  animation: slideInUp 0.35s cubic-bezier(0.55, 0, 0.1, 1) forwards;
}

@keyframes slideOutUp {
  to { transform: translateY(-20px); opacity: 0; }
}

@keyframes slideOutDown {
  to { transform: translateY(20px); opacity: 0; }
}

@keyframes slideInDown {
  from { transform: translateY(20px); opacity: 0; }
}

@keyframes slideInUp {
  from { transform: translateY(-20px); opacity: 0; }
}

.flash-content-mobile {
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
}

.marquee-track {
  display: flex;
  width: max-content;
  align-items: center;
}

.marquee-content {
  display: flex;
  white-space: nowrap;
  animation: marquee-anim 45s linear infinite;
  align-items: center;
}

.marquee-item {
  display: inline-flex;
  align-items: center;
  padding-right: 1.5rem;
  cursor: pointer;
}

.marquee-item:hover .marquee-text {
  color: var(--color-coffee-600);
}

.marquee-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-coffee-900);
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.marquee-divider {
  margin-left: 1.5rem;
  color: var(--color-coffee-100);
  font-weight: 500;
  user-select: none;
}

@keyframes marquee-anim {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}

.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .flash-news-bar {
    margin-top: 2.5rem;
    margin-bottom: 2.5rem;
    padding: 0 1rem;
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex !important;
  }
}
</style>
