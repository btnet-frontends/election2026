<template>
  <section v-show="isComponentVisible('Vote')" id="vote" class="vote-section" :style="{ backgroundImage: `url(${pollsBg})`}">
    <div class="container vote-container">
      <div class="section-header">
        <span class="vote-title">
          <img :src="voteIcon" alt="vote" class="vote-icon" />
          開票速報
        </span>
        <div class="vote-divider"></div>
        <p v-if="phase === 'start'" class="map-note">地圖顏色依目前最高票候選人政黨呈現，最高票平手以網格顯示；領先不代表當選。</p>
      </div>

      <div class="vote_area">
        <div class="taiwan_location_box">
          <taiwanLocation
            v-model:selected-location="selectedLocation"
            :location-colors="(phase === 'start' ? result?.leadingColors : result?.winnerColors) ?? {}"
            @location-selected="scrollToVotePanel"
          />
        </div>
        <div ref="votePanelElement" class="vote_panel_box">
          <votePanel v-model:selected-location="selectedLocation" :result="result" :refresh-failed="refreshFailed" />
        </div>
      </div>
    </div>
  </section>
  <button
    v-if="phase === 'start'"
    type="button"
    class="watch-vote-button"
    aria-controls="vote"
    @click="scrollToVote"
  >觀看開票</button>
</template>

<script setup>
import { nextTick, ref } from 'vue';
import { useLiveVoteResult } from '../composables/useLiveVoteResult.js';
import voteIcon from '../assets/images/election_vote_icon.svg?url';
import pollsBg from '../assets/images/polls_bg.png?url';
import taiwanLocation from './taiwanLocation.vue';
import votePanel from './votePanel.vue';
import { usePhase } from '../composables/usePhase.js';

const props = defineProps({ initialResult: { type: Object, default: null } });
const { result, refreshFailed } = useLiveVoteResult(props.initialResult);

const { phase, isComponentVisible } = usePhase();
const selectedLocation = ref('台北市');
const votePanelElement = ref(null);

const scrollToVote = () => {
  document.getElementById('vote')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start'
  });
};

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
.watch-vote-button {
  position: fixed;
  right: 20px;
  bottom: calc(2rem + 72px + env(safe-area-inset-bottom, 0px));
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  padding: 1rem 0.65rem;
  border: 2px solid #fff;
  border-radius: 999px;
  background: var(--color-coffee-accent);
  color: #fff;
  box-shadow: 0 4px 16px #332a2133;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.15em;
  cursor: pointer;
}

.watch-vote-button:hover {
  background: var(--color-coffee-600);
}

.watch-vote-button:focus-visible {
  outline: 3px solid #d99538;
  outline-offset: 3px;
}

@media (min-width: 640px) {
  .watch-vote-button {
    right: 30px;
    width: 56px;
    font-size: 1.125rem;
  }
}

.map-note {
  margin: 1rem 0 0;
  color: var(--color-coffee-900);
  font-size: 0.875rem;
}

.vote-section {
  padding: 6rem 0 6rem 0;
  overflow: hidden;
}

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
