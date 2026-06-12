<template>
  <div class="flash-news-bar container">
    <div class="flash-outer">
      <div class="flash-container">
        <div class="flash-badge">快訊</div>
        
        <div class="flash-content-wrapper desktop-only">
          <transition :name="direction === 'down' ? 'ticker-down' : 'ticker-up'" mode="out-in">
            <div :key="currentIndex" class="ticker-item">
              <span class="ticker-text">{{ currentNews.text }}</span>
              <span class="ticker-date">{{ currentNews.date }}</span>
            </div>
          </transition>
        </div>

        <div class="flash-content-mobile mobile-only">
          <div class="marquee-track">
            <div class="marquee-content">
              <span v-for="(item, idx) in flashNewsList" :key="idx" class="marquee-item">
                <span class="marquee-text">{{ item.text }}</span>
                <span class="marquee-divider">/</span>
              </span>
              <!-- Duplicate list once to allow seamless loop -->
              <span v-for="(item, idx) in flashNewsList" :key="'dup-' + idx" class="marquee-item">
                <span class="marquee-text">{{ item.text }}</span>
                <span class="marquee-divider">/</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Desktop Mode Controls -->
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

const flashNewsList = [
  { text: '2026九合一選舉各縣市候選人登記正式出爐！', date: '2026.09.04' },
  { text: '最新民調公布：關鍵縣市支持率出現重大拉鋸，藍綠選情陷入膠著！', date: '2026.09.05' },
  { text: '首波縣市長參選人政策發表會日程敲定，本週末展開線上直播！', date: '2026.09.06' },
  { text: '【選戰分析】連任名單交棒縣市分析、第三勢力崛起板圖完整評估！', date: '2026.09.07' }
];

const currentIndex = ref(0);
const direction = ref('down');
let autoPlayTimer = null;

const currentNews = computed(() => flashNewsList[currentIndex.value]);

const nextNews = () => {
  direction.value = 'down';
  currentIndex.value = (currentIndex.value + 1) % flashNewsList.length;
  resetTimer();
};

const prevNews = () => {
  direction.value = 'up';
  currentIndex.value = (currentIndex.value - 1 + flashNewsList.length) % flashNewsList.length;
  resetTimer();
};

const startTimer = () => {
  autoPlayTimer = setInterval(() => {
    direction.value = 'down';
    currentIndex.value = (currentIndex.value + 1) % flashNewsList.length;
  }, 4500);
};

const resetTimer = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
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
  flex-grow: 1;
  padding: 0 1.5rem;
  overflow: hidden;
  height: 100%;
  display: flex;
  align-items: center;
}

.ticker-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.ticker-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticker-date {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  color: #917F6B;
  font-weight: 600;
  flex-shrink: 0;
}

.flash-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border-left: 1px solid var(--color-border);
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
  transition: all var(--transition-fast);
}

.control-btn svg {
  width: 20px;
  height: 20px;
}

.control-btn:hover {
  background-color: #e8dfd7;
  color: #a09890;
}

.ticker-down-enter-active,
.ticker-down-leave-active,
.ticker-up-enter-active,
.ticker-up-leave-active {
  transition: all 0.35s cubic-bezier(0.55, 0, 0.1, 1);
}

.ticker-down-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.ticker-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.ticker-up-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.ticker-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
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
}

.marquee-text {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.marquee-divider {
  margin-left: 1.5rem;
  color: var(--color-coffee-100);
  font-weight: 500;
  user-select: none;
}

@keyframes marquee-anim {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}

/* Responsive display switches */
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