<template>
  <section v-if="phase === 'start'" class="vote-ticker-section" aria-label="開票跑馬燈" :style="{ backgroundImage: `url(${pollsBg})` }">
    <div class="container">
      <VoteTicker :result="result" :refresh-failed="refreshFailed" />
    </div>
  </section>
  <section v-show="isComponentVisible('Vote')" id="vote" class="vote-section" :style="{ backgroundImage: `url(${pollsBg})`}">
    <div class="container vote-container">
      <div class="section-header">
        <span class="vote-title">
          <img :src="voteIcon" alt="vote" class="vote-icon" />
          開票速報
        </span>
        <div class="vote-divider"></div>
      </div>

      <div class="vote_area">
        <div class="taiwan_location_box">
          <taiwanLocation
            v-model:selected-location="selectedLocation"
            :location-colors="result?.winnerColors ?? {}"
            @location-selected="scrollToVotePanel"
          />
        </div>
        <div ref="votePanelElement" class="vote_panel_box">
          <votePanel v-model:selected-location="selectedLocation" :result="result" :refresh-failed="refreshFailed" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { fetchInvoicingResult, INVOICING_RESULT_URL } from '../utils/invoicingResultApi.js';
import voteIcon from '../assets/images/election_vote_icon.svg?url';
import pollsBg from '../assets/images/polls_bg.png?url';
import taiwanLocation from './taiwanLocation.vue';
import votePanel from './votePanel.vue';
import VoteTicker from './VoteTicker.vue';
import { usePhase } from '../composables/usePhase.js';

const props = defineProps({ initialResult: { type: Object, default: null } });
// 地圖與面板共用同一份開票資料及更新排程。
const result = ref(props.initialResult);
const refreshFailed = ref(false);

let refreshTimer;
let controller;
let stopped = false;

const refresh = async () => {
  if (stopped || controller || document.hidden) return;
  clearTimeout(refreshTimer);
  const request = new AbortController();
  controller = request;
  const timeout = setTimeout(() => request.abort(), 10000);
  try {
    const url = import.meta.env.DEV ? '/api/invoicing-result' : INVOICING_RESULT_URL;
    const nextResult = await fetchInvoicingResult(url, request.signal);
    if (!stopped && !request.signal.aborted) {
      result.value = nextResult;
      refreshFailed.value = false;
    }
  } catch (error) {
    if (!stopped) {
      refreshFailed.value = true;
      console.error('更新開票資料失敗:', error);
    }
  } finally {
    clearTimeout(timeout);
    controller = null;
    if (!stopped) refreshTimer = setTimeout(refresh, 30000);
  }
};

onMounted(() => {
  refresh();
  document.addEventListener('visibilitychange', refresh);
});
onUnmounted(() => {
  stopped = true;
  clearTimeout(refreshTimer);
  document.removeEventListener('visibilitychange', refresh);
  controller?.abort();
});

const { phase, isComponentVisible } = usePhase();
const selectedLocation = ref('台北市');
const votePanelElement = ref(null);

const scrollToVotePanel = async () => {
  if (!window.matchMedia('(max-width: 1024px)').matches) return;

  await nextTick();
  votePanelElement.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
};
</script>

<style scoped>
.vote-ticker-section {
  padding: 2rem 0;
}

.vote-section {
  padding: 6rem 0 6rem 0;
  overflow: hidden;
}

.vote-ticker-section,
.vote-section {
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

.container.vote-container {
  max-width: 100%;
}

.section-header {
  margin-bottom: 3.5rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0rem;
  text-align: center;
}

.vote-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.vote-title {
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

.vote-divider{
  width: 13rem;
  height: 2px;
  background-color: var(--color-coffee-300);
}

.vote_area{
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: clamp(2rem, 5vw, 5rem);
  flex-direction: row;
  min-height: 30vw;
}

.taiwan_location_box{
  position: relative;
  display: block;
  width: 100%;
  left: -10%;
  max-width: 1500px;
  margin: 0 auto;
}

.vote_panel_box{
  position: relative;
  display: block;
  width: 450px;
  min-width: 400px;
  right: 20%;
  margin-top: 5%;
}

@media (max-width: 1470px) {
  .vote_panel_box{
    width: 30%;
    right: 15%;
  }
}

@media (max-width: 1366px) {
  .taiwan_location_box{
    left: 0;
  }
  .vote_panel_box{
    right: 5%;
    width: 30%;
  }
}

@media (max-width: 1024px) {
  .vote-section {
    padding: 4rem 0;
  }
  .vote_area{
    flex-direction: column;
  }
  .vote_panel_box{
    position: relative;
    right: 0;
    left: 0;
    margin: 0 auto;
    width: 100%;
    min-width: 0;
    scroll-margin-top: 110px;
  }
}

@media (max-width: 575px) {
  .vote-section {
    padding: 3rem 0;
  }

  .section-header {
    margin-bottom: 2.5rem;
  }
}

</style>
