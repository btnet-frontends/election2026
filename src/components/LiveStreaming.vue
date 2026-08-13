<template>
  <section v-show="isComponentVisible('LiveStreaming')" id="live-streaming" class="live-streaming-section">
    <div class="container">
      <div class="section-header">
        <span class="live-streaming-title">
          <img :src="liveStreamingIcon" alt="search" class="search-icon" />
          現場直播
        </span>
        <div class="live-streaming-divider"></div>
      </div>

      <div class="live-streaming-frame">
        <iframe
          :src="config.LiveStreaming.liveStreamingUrl"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
      
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import liveStreamingIcon from '../assets/images/live_streaming_icon.svg?url';
import config from '../json/data.json';
import { usePhase } from '../composables/usePhase.js';

const { isComponentVisible } = usePhase();
</script>

<style scoped>
.live-streaming-section {
  padding: 6rem 0;
  background: var(--color-coffee-0) 100%;
}

.container {
  position: relative;
  z-index: 1;
}

.section-header {
  margin-bottom: 3.5rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0rem;
  text-align: center;
}

.search-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.live-streaming-title {
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

.live-streaming-divider{
  width: 13rem;
  height: 2px;
  background-color: var(--color-coffee-300);
}

.live-streaming-frame {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.live-streaming-frame iframe {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
