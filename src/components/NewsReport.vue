<template>
  <section id="news" class="news-section">
    <div class="container">

      <NewsCarousel :items="carouselItems" />

      <HotTags :model-value="activeTag" :tags="hotTags" @update:model-value="selectTag" />

      <div class="news-list-container">
        <div v-if="isNewsLoading" class="skeleton-grid">
          <div v-for="n in 3" :key="n" class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-info">
              <div class="skeleton-line-sm"></div>
              <div class="skeleton-line-lg"></div>
              <div class="skeleton-line-md"></div>
            </div>
          </div>
        </div>

        <transition-group v-else name="list-fade" tag="div" class="news-grid">
          <a
            v-for="item in visibleNews"
            :key="item.article_id"
            :href="item.output_link_path"
            target="_blank"
            rel="noopener noreferrer"
            class="news-card"
          >
            <div class="news-card-img-wrap">
              <img :src="item.image_url" :alt="item.title" class="news-card-img" loading="lazy" />
            </div>
            <div class="news-card-body">
              <div class="news-card-top">
                <h4 class="news-card-title" v-html="item.title"></h4>
                <span class="news-card-date">{{ formatDate(item.pubtime) }}</span>
              </div>
              <div class="news-card-tags" v-if="getItemTags(item, filterTags).length">
                <span v-for="tag in getItemTags(item, filterTags)" :key="tag" class="news-card-tag"># {{ tag }}</span>
              </div>
              <p class="news-card-excerpt" v-html="item.part_text"></p>
              <div class="news-card-footer">
                <span class="news-card-more">
                  詳全文
                  <svg class="more-arrow more-arrow-static" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                  <svg class="more-arrow more-arrow-hover" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </div>
          </a>
        </transition-group>

        <div v-if="hasMoreNews && !isNewsLoading" class="load-more-wrapper">
          <div class="load-more-fade"></div>
          <button
            :class="['load-more-btn', { loading: isMoreLoading }]"
            @click="loadMore"
            :disabled="isMoreLoading"
          >
            <span v-if="isMoreLoading" class="spinner"></span>
            展開更多
            <svg v-if="!isMoreLoading" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import NewsCarousel from './NewsCarousel.vue';
import HotTags from './HotTags.vue';
import { useNewsFeed } from '../composables/useNewsFeed.js';
import { formatDate, getItemTags } from '../utils/newsUtils.js';
import siteData from '../json/data.json';

const props = defineProps({
  initialNews: {
    type: Object,
    required: true,
  },
  hotTags: {
    type: Array,
    required: true,
  },
});

const CAROUSEL_COUNT = 0;

const {
  newsList,
  activeTag,
  isNewsLoading,
  isMoreLoading,
  filterTags,
  visibleNews,
  hasMoreNews,
  selectTag,
  loadMore,
} = useNewsFeed(props.initialNews, props.hotTags, CAROUSEL_COUNT);

const carouselItems = ref(siteData.newsReport.carouselItems);
</script>

<style scoped>
.news-section {
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
  .news-section {
    background: linear-gradient(
      to bottom,
      var(--color-coffee-50) 0px,
      var(--color-coffee-50) 190px,
      var(--color-coffee-0) 380px,
      var(--color-coffee-0) 100%
    );
  }
}

.news-list-container {
  width: 100%;
}

.news-grid {
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.news-card {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  overflow: visible;
  padding: 1.75rem 0;
  gap: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.news-card + .news-card {
  border-top: 1px solid var(--color-coffee-200);
}

.news-card-img-wrap {
  flex-shrink: 0;
  width: 300px;
  height: 216px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-coffee-50);
}

.news-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.news-card:hover .news-card-img {
  transform: scale(1.05);
}

.news-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding: 0.25rem 0.5rem 0.25rem 0;
}

.news-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.news-card-title {
  margin: 0;
  font-size: clamp(1.1rem, 1.8vw, 1.55rem);
  line-height: 1.3;
  font-weight: 800;
  color: var(--color-coffee-900);
  flex: 1;
  min-width: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.news-card-date {
  font-family: 'Outfit', 'Noto Sans TC', sans-serif;
  color: #7b7b7b;
  font-size: 0.82rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 0.2rem;
}

.news-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
}

.news-card-tag {
  color: var(--color-primary);
  font-size: 0.88rem;
  font-weight: 700;
}

.news-card-excerpt {
  margin: 0;
  flex: 1;
  font-size: 1.1rem;
  color: var(--color-coffee-600);
  line-height: 1.75;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.65rem;
}

.news-card-more {
  color: var(--color-coffee-600);
  font-size: 1.1rem;
  font-weight: 900;
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 2px;
  position: relative;
  padding-right: 14px;
}

/* 預設一直顯示的箭頭 */
.more-arrow-static {
  flex-shrink: 0;
  margin-right: -4px;
}

/* hover 時額外出現的第二支箭頭,用絕對定位疊加,不佔文字流的寬度,避免文字被推動 */
.more-arrow-hover {
  position: absolute;
  right: -2px;
  top: 50%;
  opacity: 0;
  transform: translateY(-50%) translateX(-4px);
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (hover: hover) {
  .news-card:hover .more-arrow-hover {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

.news-card:hover .news-card-more {
  color: var(--color-primary);
}

.skeleton-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3.5rem;
}

.skeleton-card {
  background: var(--color-coffee-0);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1rem;
  gap: 1.25rem;
  height: 218px;
}

.skeleton-img {
  flex-shrink: 0;
  width: 280px;
  height: 196px;
  border-radius: 10px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loadingAnim 1.5s infinite;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 0.5rem 0;
}

.skeleton-line-sm {
  width: 25%;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loadingAnim 1.5s infinite;
}

.skeleton-line-lg {
  width: 85%;
  height: 22px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loadingAnim 1.5s infinite;
}

.skeleton-line-md {
  width: 70%;
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loadingAnim 1.5s infinite;
}

@keyframes loadingAnim {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.load-more-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-top: -220px;
  padding-bottom: 1.5rem;
  height: 200px;
}

.load-more-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, var(--color-coffee-0) 75%);
  pointer-events: none;
}

.load-more-btn {
  position: relative;
  z-index: 1;
  background: var(--color-coffee-0);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  font-weight: 800;
  font-size: 1.2rem;
  padding: 0.8rem 2.2rem;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.load-more-btn:hover {
  background: var(--color-primary);
  color: var(--color-coffee-0);
  box-shadow: 0 6px 16px rgba(230, 0, 18, 0.2);
  transform: translateY(-2px);
}

.load-more-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s infinite linear;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.5s ease;
}

.list-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 768px) {
  .news-card-img-wrap {
    width: 200px;
    aspect-ratio: 5 / 4;
    height: auto;
  }

  .news-card-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 576px) {
  .news-card {
    flex-direction: column;
    padding: 1.5rem 0;
    gap: 0.75rem;
  }

  .news-card-img-wrap {
    width: 100%;
    aspect-ratio: 16 / 10;
    height: auto;
    border-radius: 8px;
  }

  .news-card-body {
    padding: 0;
  }

  .news-card-top {
    flex-direction: column;
    gap: 0.25rem;
  }

  .news-card-date {
    order: -1;
  }

  .news-card-excerpt {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  .skeleton-card {
    flex-direction: column;
    height: auto;
    padding: 0.75rem;
  }

  .skeleton-img {
    width: 100%;
    aspect-ratio: 16 / 10;
    height: auto;
    border-radius: 8px;
  }
}
</style>