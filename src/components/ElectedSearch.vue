<template>
  <section id="elected-search" class="elected-search-section">
    <div class="container elected-search-container">
      <div class="section-header">
        <span class="elected-search-title">
          <img :src="searchIcon" alt="search-icon" class="search-icon" />
          當選快搜
        </span>
        <div class="elected-search-divider"></div>
      </div>

      <div class="elected_search_area">
        
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import searchIcon from '../assets/images/search_icon.svg?url';

</script>

<style scoped>
.elected-search-section {
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
  .elected-search-section {
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

.search-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

.elected-search-title {
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

.elected-search-divider{
  width: 13rem;
  height: 2px;
  background-color: var(--color-coffee-300);
}

.elected_search_area {
  --seat-coffee: #917f6b;
  --seat-arrow: #8e6429;
  --seat-total: #888888;
  margin-top: 2.5rem;
}

</style>
