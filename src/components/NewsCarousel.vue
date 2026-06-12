<template>
  <div class="carousel-wrapper" :class="{ 'carousel--mounted': isMounted }">
    <div class="carousel-track">
      <div
        v-for="(item, index) in items"
        :key="item.article_id"
        class="carousel-slide"
        :class="{ active: activeSlide === index }"
      >
        <div class="slide-media">
          <img :src="item.image_url_a || item.image_url" :alt="item.title" class="slide-image" />
          <div class="slide-overlay-color"></div>
          <div class="slide-overlay-dark"></div>
          <div class="slide-content-desktop">
            <div class="slide-text">
              <h3 class="slide-title">{{ item.title }}</h3>
              <p class="slide-excerpt">{{ item.part_text }}</p>
            </div>
            <a :href="item.href || item.output_link_path" target="_blank" class="slide-btn">
              閱讀文章
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21 12l-8.15-8.15-1.42 1.42 5.43 5.43H5v2z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="carousel-dots">
      <button
        v-for="(_, index) in items"
        :key="index"
        :class="['dot', { active: activeSlide === index }]"
        @click="setSlide(index)"
        :aria-label="`Go to slide ${index + 1}`"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCarousel } from '../composables/useCarousel.js';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['slide-change']);

const itemsRef = computed(() => props.items);

const { activeSlide, isMounted, setSlide: _setSlide } = useCarousel(itemsRef);

const setSlide = (index) => {
  _setSlide(index);
  emit('slide-change', index);
};
</script>

<style scoped>
.carousel-wrapper {
  margin-bottom: 4rem;
}

.carousel-track {
  position: relative;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--color-bg-pure);
  min-height: 560px;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.6s ease, visibility 0.6s ease;
  display: flex;
  flex-direction: column;
}

.carousel-slide.active {
  position: relative;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.slide-media {
  position: relative;
  width: 100%;
  height: 560px;
  overflow: hidden;
  flex-shrink: 0;
}

.slide-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: none;
}

.carousel--mounted .slide-image {
  transition: transform 6s ease;
}

.carousel-slide.active .slide-image {
  transform: scale(1.03);
}

.slide-overlay-color {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(124, 255, 176, 0) 9%,
    rgba(41, 217, 202, 0.43) 52%,
    rgba(73, 133, 217, 0.72) 100%
  );
}

.slide-overlay-dark {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.35) 0%,
    rgba(0, 0, 0, 0) 60%
  );
}

.slide-content-desktop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 2.5rem 3rem;
  gap: 2rem;
}

.slide-text {
  flex: 0 0 60%;
  min-width: 0;
}

.slide-title {
  font-size: 1.9rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.35;
  margin-bottom: 0.6rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.45);
}

.slide-excerpt {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
}

.slide-btn {
  position: absolute;
  right: 3rem;
  bottom: 2.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.slide-btn:hover {
background: var(--color-primary);
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  padding-top: 1.25rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all var(--transition-normal);
}

.dot.active {
  width: 24px;
  border-radius: 4px;
  background: #D3A671;
}

@media (max-width: 768px) {
  .carousel-track {
    border-radius: 16px;
    min-height: 320px;
  }

  .slide-media {
    height: 320px;
  }

  .slide-content-desktop {
    display: flex;
    padding: 1.5rem;
    gap: 1rem;
  }

  .slide-title {
    font-size: 1.25rem;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .slide-excerpt {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 0.85rem;
  }

  .slide-btn {
    display: none;
  }

  .slide-text {
    flex: 1;
  }
}
</style>
