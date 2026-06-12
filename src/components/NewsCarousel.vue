<template>
  <div class="carousel-wrapper">
    <Swiper
      :modules="modules"
      :pagination="{ clickable: true }"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :loop="true"
      class="carousel-track"
    >
      <SwiperSlide
        v-for="item in items"
        :key="item.article_id"
      >
        <div class="slide-media">
          <img :src="item.image_url":alt="item.title" class="slide-image" />
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
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

defineProps({
  items: {
    type: Array,
    required: true,
  },
});

defineEmits(['slide-change']);

const modules = [Pagination, Autoplay];
</script>

<style scoped>
.carousel-wrapper {
  margin-bottom: 3rem;
}

.carousel-track {
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.slide-media {
  position: relative;
  width: 100%;
  height: 560px;
  overflow: hidden;
}

.slide-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  flex: 0 0 61%;
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

:deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.6);
  opacity: 1;
}

:deep(.swiper-pagination-bullet-active) {
  width: 24px;
  border-radius: 4px;
  background: #ffffff;
}

:deep(.swiper-pagination) {
  bottom: 1rem;
  display: flex;
  justify-content: center;
  gap: 0.4rem;
}

@media (max-width: 768px) {
  .carousel-track {
    border-radius: 16px;
  }

  .slide-media {
    height: 320px;
  }

  .slide-content-desktop {
    padding: 1.5rem;
    gap: 1rem;
  }

  .slide-title {
    font-size: 1.25rem;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .slide-excerpt {
    -webkit-line-clamp: 1;
    line-clamp: 1;
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