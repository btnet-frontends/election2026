<template>
  <section id="vote" class="vote-section" :style="{ backgroundImage: `url(${pollsBg})`}">
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
          <taiwanLocation />
        </div>
        <div class="vote_panel_box">
          <votePanel />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import voteIcon from '../assets/images/election_vote_icon.svg?url';
import pollsBg from '../assets/images/polls_bg.png?url';
import taiwanLocation from './taiwanLocation.vue';
import votePanel from './votePanel.vue';
import config from '../json/data.json';


</script>

<style scoped>
.vote-section {
  padding: 6rem 0;
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
  width: 100%;
  gap: 2rem;
  flex-direction: row;
}

.taiwan_location_box{
  position: relative;
  display: block;
  width: 80%;
}

.vote_panel_box{
  position: relative;
  display: block;
  width: 20%;
}

</style>
