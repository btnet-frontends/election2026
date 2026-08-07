<template>
  <section id="seats" class="seats-section">
    <div class="container">
      <div class="section-header">
        <span class="seats-title">
          <img :src="statisticsIcon" alt="statistics" class="statistics-icon" />
          選情統計
        </span>
        <div class="seats-divider"></div>
      </div>
      <div class="section-subtitle">
        <h2>• 各縣市議員席次 •</h2>
      </div>

     
    </div>
  </section>
</template>

<script setup>
    import statisticsIcon from '../assets/images/statistics_icon.svg?url';

</script>

<style scoped>
.seats-section {
  padding: 2rem 0 7rem;
  background: linear-gradient(
    to bottom,
    var(--color-coffee-50) 0px,
    var(--color-coffee-50) 300px,
    var(--color-coffee-0) 600px,
    var(--color-coffee-0) 100%
  );
}

@media (max-width: 768px) {
  .seats-section {
    background: linear-gradient(
      to bottom,
      var(--color-coffee-50) 0px,
      var(--color-coffee-50) 190px,
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

.seats-title {
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

.seats-divider{
  width: 13rem;
  height: 2px;
  background-color: var(--color-coffee-300);
}

.section-subtitle{
    text-align: center;
    color: var(--color-coffee-300);
}

</style>
