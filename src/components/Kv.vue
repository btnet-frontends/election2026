<template>
  <section ref="kvSection" id="kv" class="kv-section">
    <Teleport to="body" v-if="isMounted">
      <div ref="parallaxRight" class="parallax-bg parallax-right">
        <img :src="bgCircle" alt="" class="bg-circle" aria-hidden="true" />
      </div>
      <div ref="parallaxLeft" class="parallax-bg parallax-left">
        <img :src="bgCircle" alt="" class="bg-circle" aria-hidden="true" />
      </div>
    </Teleport>

    <svg
      class="kv-bggroup-n"
      viewBox="0 0 1920 347"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <mask id="kv-curve-draw-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="347">
          <rect width="1920" height="347" fill="black" />
          <path
            class="kv-curve-reveal"
            d="M -100 158 C 190 5 390 32 650 132 C 900 228 1115 310 1405 275 C 1645 247 1830 137 2020 -28"
            fill="none"
            stroke="white"
            stroke-width="180"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </mask>
      </defs>
      <image
        :href="kvBgGroupN"
        width="1920"
        height="347"
        mask="url(#kv-curve-draw-mask)"
      />
    </svg>

    <div class="kv-left-wrapper">
      <div class="kv-left">
        <img :src="kvCloud" alt="" class="kv-cloud" aria-hidden="true" />
        <img :src="kvTitle" alt="2026 九合一大選" class="kv-title" />
        <img :src="kvSubtitle1" alt="今周戰情室" class="kv-subtitle1" />
        <p class="kv-subtitle2">縣市長選舉 即時報導、參選人新聞一次看！</p>

        <div class="cd-row">
          <span class="cd-num">{{ t.days }}</span><span class="cd-unit">天</span>
          <span class="cd-sep">|</span>
          <span class="cd-num">{{ t.hours }}</span><span class="cd-unit">時</span>
          <span class="cd-sep">|</span>
          <span class="cd-num">{{ t.minutes }}</span><span class="cd-unit">分</span>
          <span class="cd-sep">|</span>
          <span class="cd-num">{{ t.seconds }}</span><span class="cd-unit">秒</span>
        </div>
      </div>
    </div>

    <div class="kv-right">
      <img :src="kvPeople" alt="選舉人物插圖" class="kv-people" />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

import kvBgGroupN  from '../assets/images/kv_bggroup_n.png?url';
import kvCloud     from '../assets/images/kv_cloud.svg?url';
import kvTitle     from '../assets/images/kv_title.svg?url';
import kvPeople    from '../assets/images/kv_people.svg?url';
import kvSubtitle1 from '../assets/images/kv_subtitle1.png?url';
import bgCircle    from '../assets/images/bg_circle.svg?url';

const ELECTION_DATE = '2026-11-28T16:00:00+08:00';
const electionDate = new Date(ELECTION_DATE).getTime();
const t = ref({ days: '--', hours: '--', minutes: '--', seconds: '--' });
let timer = null;

const isMounted = ref(false);

const kvSection = ref(null);
const parallaxLeft = ref(null);
const parallaxRight = ref(null);

const tick = () => {
  const d = electionDate - Date.now();
  if (d < 0) {
    t.value = { days: '00', hours: '00', minutes: '00', seconds: '00' };
    clearInterval(timer);
    return;
  }
  t.value = {
    days:    String(Math.floor(d / 86400000)),
    hours:   String(Math.floor((d % 86400000) / 3600000)).padStart(2, '0'),
    minutes: String(Math.floor((d % 3600000)  / 60000)).padStart(2, '0'),
    seconds: String(Math.floor((d % 60000)    / 1000)).padStart(2, '0'),
  };
};

const handleScroll = () => {
  if (!kvSection.value) return;

  const scrollY = window.scrollY;
  const kvHeight = kvSection.value.offsetHeight;
  const kvTop = kvSection.value.offsetTop;
  const carouselStartPos = kvTop + kvHeight;

  const pollsSection = document.getElementById('polls');
  let currentOpacity = 0;

  if (scrollY >= carouselStartPos) {
    currentOpacity = 1;

    if (pollsSection) {
      const triggerPoint = pollsSection.offsetTop - window.innerHeight;
      const fadeStart = triggerPoint - 200;

      if (scrollY >= triggerPoint) {
        currentOpacity = 0;
      } else if (scrollY >= fadeStart) {
        currentOpacity = 1 - (scrollY - fadeStart) / 200;
      }
    }
  }

  if (parallaxRight.value) {
    if (currentOpacity > 0) {
      const rotationOffset = scrollY - carouselStartPos;
      const rotation = (rotationOffset * 360 / 1000) % 360;
      parallaxRight.value.style.opacity = String(currentOpacity);
      parallaxRight.value.style.transform = `rotate(${rotation}deg)`;
    } else {
      parallaxRight.value.style.opacity = '0';
    }
  }

  if (parallaxLeft.value) {
    if (currentOpacity > 0) {
      const rotationOffset = scrollY - carouselStartPos;
      const rotation = (rotationOffset * 360 / 1000) % 360;
      parallaxLeft.value.style.opacity = String(currentOpacity);
      parallaxLeft.value.style.transform = `rotate(${rotation}deg)`;
    } else {
      parallaxLeft.value.style.opacity = '0';
    }
  }
};

onMounted(() => {
  isMounted.value = true;
  tick();
  timer = setInterval(tick, 1000);
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes drawKvCurve {
  from { stroke-dashoffset: 2400; }
  to   { stroke-dashoffset: 0; }
}

.kv-section {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 600px;
  overflow: hidden;
  box-sizing: border-box;
  background-color: var(--color-coffee-50);
}

.parallax-bg {
  position: fixed;
  pointer-events: none;
  z-index: 0;
  will-change: transform;
  opacity: 0;
  transition: opacity 0.3s ease;
}

@media (max-width: 1440px) {
  .parallax-bg {
    display: none !important;
  }
}

.parallax-left {
  left: -350px;
  top: 55%;
  width: 40%;
  max-width: 520px;
  transform: rotate(0deg);
}

.parallax-right {
  right: -350px;
  top: 20%;
  width: 45%;
  max-width: 580px;
  transform: rotate(0deg);
}

.bg-circle {
  display: block;
  width: 100%;
  height: auto;
  opacity: 0.7;
  user-select: none;
}

.kv-bggroup-n {
  position: absolute;
  top: 30%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  min-width: 800px;
  height: auto;
  pointer-events: none;
  user-select: none;
  z-index: 1;
}

.kv-curve-reveal {
  stroke-dasharray: 2400;
  stroke-dashoffset: 2400;
  animation: drawKvCurve 2.4s cubic-bezier(0.65, 0, 0.35, 1) 0.15s both;
}

.kv-left-wrapper {
  position: absolute;
  top: calc(96px + (100% - 96px) / 2);
  left: 6%;
  transform: translateY(-50%);
  width: 42%;
  z-index: 3;
}

.kv-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeInUp 1s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
}

.kv-cloud {
  position: absolute;
  top: -2rem;
  right: -2rem;
  width: 18%;
  pointer-events: none;
  z-index: 4;
}

.kv-title {
  display: block;
  width: 92%;
  max-width: 460px;
  height: auto;
  margin-bottom: 0.9rem;
}

.kv-subtitle1 {
  display: block;
  width: 55%;
  height: auto;
  margin-bottom: 0.8rem;
}

.kv-subtitle2 {
  font-size: clamp(1rem, 1.6vw, 1.4rem);
  font-weight: 500;
  color: var(--color-coffee-600);
  letter-spacing: 0.06em;
  line-height: 1.6;
  margin-bottom: 1.8rem;
  white-space: nowrap;
}

.cd-row {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  flex-wrap: nowrap;
}

.cd-num {
  font-size: clamp(2rem, 3vw, 3rem);
  font-weight: 900;
  color: var(--color-coffee-600);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.cd-unit {
  font-size: clamp(0.9rem, 1.2vw, 1.1rem);
  font-weight: 500;
  color: var(--color-coffee-600);
}

.cd-sep {
  font-size: clamp(1rem, 1.5vw, 1.3rem);
  color: var(--color-coffee-300);
  font-weight: 300;
}

.kv-right {
  position: absolute;
  right: 5%;
  bottom: 6%;
  width: 50%;
  height: 90%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  z-index: 2;
  pointer-events: none;
}

.kv-people {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom right;
  animation: fadeInRight 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
}


@media (max-width: 768px) {
  .parallax-left {
    left: -220px;
    top: 60%;
    width: 45%;
    max-width: 360px;
  }

  .parallax-right {
    right: -220px;
    top: 15%;
    width: 50%;
    max-width: 400px;
  }
}

@media (min-width: 769px) and (max-width: 1280px) and (min-height: 900px) {
  .kv-section {
    height: auto;
    min-height: 100svh;
    overflow-x: hidden;
    overflow-y: visible;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 80px;
    padding-bottom: 3rem;
  }

  .kv-left-wrapper {
    position: static;
    top: auto;
    transform: none;
    width: min(85%, 560px);
  }

  .kv-left {
    align-items: center;
    text-align: center;
  }

  .kv-title {
    width: 80%;
    max-width: none;
    margin: 0 auto 0.8rem;
  }

  .kv-subtitle1 {
    max-width: 80%;
    margin: 0 auto 0.8rem;
  }

  .kv-subtitle2 {
    white-space: normal;
    font-size: clamp(0.95rem, 2vw, 1.15rem);
    margin: 0 auto 1rem;
  }

  .cd-row { justify-content: center; }
  .cd-num { font-size: clamp(1.6rem, 3.5vw, 2.4rem); }
  .cd-unit { font-size: clamp(0.8rem, 1.5vw, 1rem); }
  .cd-sep { font-size: clamp(0.9rem, 1.5vw, 1.1rem); }

  .kv-right {
    position: static;
    width: min(85%, 560px);
    height: auto;
    justify-content: center;
    align-items: flex-end;
    margin-top: 0.5rem;
  }

  .kv-people {
    width: 100%;
    height: auto;
    object-position: bottom center;
  }

  .kv-bggroup-n {
    top: 63%;
    bottom: auto;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    min-width: unset;
  }

  .parallax-left {
    left: -290px;
    top: 50%;
    width: 32%;
    max-width: 400px;
  }

  .parallax-right {
    right: -290px;
    top: 28%;
    width: 36%;
    max-width: 450px;
  }
}

@media (max-width: 768px) {
  .kv-section {
    height: auto;
    min-height: 100svh;
    overflow-x: hidden;
    overflow-y: visible;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 80px;
    padding-bottom: 3rem;
  }

  .kv-left-wrapper {
    position: static;
    top: auto;
    transform: none;
    width: 85%;
    max-width: 480px;
  }

  .kv-left {
    align-items: center;
    text-align: center;
  }

  .kv-cloud {
    top: -1rem;
    right: -1rem;
    width: 14%;
    max-width: 60px;
  }

  .kv-title {
    width: 80%;
    max-width: none;
    margin: 0 auto 0.8rem;
  }

  .kv-subtitle1 {
    width: auto;
    max-width: 80%;
    margin: 0 auto 0.8rem;
  }

  .kv-subtitle2 {
    white-space: normal;
    font-size: clamp(0.95rem, 3vw, 1.1rem);
    margin: 0 auto 1rem;
  }

  .cd-row { justify-content: center; }
  .cd-num { font-size: clamp(1.6rem, 5vw, 2.2rem); }
  .cd-unit { font-size: clamp(0.8rem, 2vw, 1rem); }
  .cd-sep { font-size: clamp(0.9rem, 2vw, 1.1rem); }

  .kv-right {
    position: static;
    width: 85%;
    max-width: 480px;
    height: auto;
    justify-content: center;
    align-items: flex-end;
    margin-top: 0.5rem;
  }

  .kv-people {
    width: 100%;
    height: auto;
    object-position: bottom center;
  }

  .kv-bggroup-n {
    top: 63%;
    bottom: auto;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    min-width: unset;
  }
}

@media (max-width: 768px) and (max-height: 600px) {
  .kv-section {
    min-height: unset;
    justify-content: flex-start;
    padding-bottom: 2rem;
  }
}

@media (max-width: 376px) {
  .kv-bggroup {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .kv-curve-reveal {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
