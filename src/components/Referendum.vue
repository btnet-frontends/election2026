<template>
  <section id="referendum" class="referendum-section">
    <div class="container">
      <div class="section-header">
        <span class="referendum-title">
          <img :src="referendumIcon" alt="referendum" class="referendum-icon" />
          憲法正案公民複決
        </span>
        <div class="referendum-divider"></div>
      </div>

      <div class="referendum_area">
        
      </div>
      
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import referendumIcon from '../assets/images/election_referendum_icon.svg?url';
import config from '../json/data.json';


</script>

<style scoped>
.referendum-section {
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

.referendum-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.referendum-title {
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

.referendum-divider{
  width: 20rem;
  height: 2px;
  background-color: var(--color-coffee-300);
}
</style>
