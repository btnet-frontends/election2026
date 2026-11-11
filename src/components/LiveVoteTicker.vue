<template>
  <section v-if="isComponentVisible('Vote')" class="vote-ticker-section" aria-label="開票跑馬燈" :style="{ backgroundImage: `url(${pollsBg})` }">
    <div class="container">
      <VoteTicker :result="result" :refresh-failed="refreshFailed" />
    </div>
  </section>
</template>

<script setup>
import VoteTicker from './VoteTicker.vue';
import pollsBg from '../assets/images/polls_bg.png?url';
import { usePhase } from '../composables/usePhase.js';
import { useLiveVoteResult } from '../composables/useLiveVoteResult.js';

const props = defineProps({ initialResult: { type: Object, default: null } });
const { isComponentVisible } = usePhase();
const { result, refreshFailed } = useLiveVoteResult(props.initialResult);
</script>

<style scoped>
.vote-ticker-section {
  padding: 0.5rem 0;
  background-color: var(--color-coffee-50);
  background-attachment: fixed;
  background-position: bottom center;
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
