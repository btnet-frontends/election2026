<template>
  <span class="candidate-name" :title="name">
    <span v-if="number != null" class="candidate-number" :aria-label="`${number} 號`">{{ number }}</span>
    <span ref="viewport" class="name-viewport">
      <span
        ref="text"
        class="name-text"
        :class="{ 'is-overflowing': overflow > 0 }"
        :style="{ '--name-offset': `${-overflow}px`, '--name-duration': `${Math.max(5, overflow / 25 + 3)}s` }"
      >{{ name }}</span>
    </span>
  </span>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

defineProps({
  name: { type: String, required: true },
  number: { type: Number, default: null }
});

const viewport = ref(null);
const text = ref(null);
const overflow = ref(0);
let observer;

const measure = () => {
  overflow.value = Math.max(0, text.value.scrollWidth - viewport.value.clientWidth);
};

onMounted(() => {
  observer = new ResizeObserver(measure);
  observer.observe(viewport.value);
  observer.observe(text.value);
  measure();
});

onUnmounted(() => observer?.disconnect());
</script>

<style scoped>
.candidate-name {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
}

.candidate-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 1.5em;
  height: 1.5em;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 0.8em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.name-viewport {
  min-width: 0;
  overflow: hidden;
}

.name-text {
  display: inline-block;
  vertical-align: middle;
  white-space: nowrap;
}

.name-text.is-overflowing {
  animation: scroll-name var(--name-duration) ease-in-out infinite alternate;
}

@keyframes scroll-name {
  0%, 20% { transform: translateX(0); }
  80%, 100% { transform: translateX(var(--name-offset)); }
}

@media (prefers-reduced-motion: reduce) {
  .name-text,
  .name-text.is-overflowing {
    animation: none;
    white-space: normal;
    overflow-wrap: anywhere;
  }
}
</style>
