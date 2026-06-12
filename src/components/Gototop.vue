<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import arrowUp from '../assets/images/arrow_up.png?url'

const show = ref(false)

function handleScroll() {
  show.value = window.scrollY > 200
}

function goToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
});
</script>

<template>
  <button
    v-if="show"
    @click="goToTop"
    class="gototop-btn"
    aria-label="回到頂部"
  >
    <img :src="arrowUp" alt="arrow_up" class="arrow_up" />
  </button>
</template>

<style scoped>
.gototop-btn {
  position: fixed;
  bottom: 2rem;
  right: 20px;
  width: 44px;
  height: 44px;
  z-index: 50;
  background: linear-gradient(135deg, #7CFFB0, #227EFF);
  border-radius: 9999px;
box-shadow: 
  0 10px 15px -3px color-mix(in srgb, var(--color-text-muted) 10%, transparent),
  0 4px 6px -2px color-mix(in srgb, var(--color-text-muted) 5%, transparent);  font-size: 1.25rem;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2.5px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gototop-btn:hover {
  transform: scale(1.1);
box-shadow: 
  0 20px 25px -5px color-mix(in srgb, var(--color-text-muted) 15%, transparent),
  0 8px 10px -6px color-mix(in srgb, var(--color-text-muted) 10%, transparent);
}

.arrow_up {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  width: 60%;
}

@media (min-width: 640px) {
  .gototop-btn {
    right: 30px;
    width: 56px;
    height: 56px;
  }
}
</style>
