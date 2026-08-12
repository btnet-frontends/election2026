<template>
  <section id="partyHistory" class="partyHistory-section">
    <div class="container partyHistory-container">
      <div class="section-subtitle">
        <h2>• 歷史版圖 •</h2>
      </div>

      <div class="partyHistory_area">
        
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import statisticsIcon from '../assets/images/statistics_icon.svg?url';

</script>

<style scoped>
.partyHistory-section {
  padding: 6rem 0 7rem;
  background: linear-gradient(
    to bottom,
    var(--color-coffee-0) 0px,
    var(--color-coffee-0) 300px,
    var(--color-coffee-0) 600px,
    var(--color-coffee-0) 100%
  );
}

@media (max-width: 768px) {
  .partyHistory-section {
    background: linear-gradient(
      to bottom,
      var(--color-coffee-0) 0px,
      var(--color-coffee-0) 190px,
      var(--color-coffee-0) 380px,
      var(--color-coffee-0) 100%
    );
  }
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

.statistics-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.partyHistory-title {
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

.partyHistory-divider{
  width: 13rem;
  height: 2px;
  background-color: var(--color-coffee-300);
}

.section-subtitle{
    text-align: center;
    color: var(--color-coffee-300);
}

.partyHistory_area {
 
}


</style>
