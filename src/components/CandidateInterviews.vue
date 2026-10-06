<template>
  <section id="candidate-interviews" class="interviews-section" aria-labelledby="interviews-title">
    <div class="interviews-header">
      <h2 id="interviews-title">
        <svg class="interviews-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
          <circle cx="12" cy="7" r="4" />
          <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
        </svg>
        選將專訪
      </h2>
      <div class="interviews-divider"></div>
    </div>

    <div v-if="visibleArticles.length" class="interviews-grid">
      <a
        v-for="item in visibleArticles"
        :key="item.article_id"
        :href="item.output_link_path"
        target="_blank"
        rel="noopener noreferrer"
        class="interview-card"
      >
        <div class="interview-image-wrap">
          <img :src="item.image_url_a || item.image_url" :alt="item.title" loading="lazy" />
        </div>
        <div class="interview-body">
          <time class="interview-date" :datetime="(item.pubtime || item.release_date || '').split(' ')[0]">
            {{ formatDate(item.pubtime || item.release_date) }}
          </time>
          <h3 v-html="item.title"></h3>
          <p v-html="item.part_text"></p>
          <span class="interview-more">
            詳全文
            <svg class="more-arrow-static" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
            <svg class="more-arrow-hover" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </a>
    </div>
    <p v-else class="interviews-status" role="status">
      {{ isLoading ? '專訪載入中…' : loadFailed ? '專訪暫時無法載入，請稍後再試。' : '更多選將專訪即將登場。' }}
    </p>
    <button v-if="loadFailed" class="interviews-button" @click="refreshArticles" :disabled="isLoading">重新載入</button>
    <div v-if="articles.length > visibleCount" class="interviews-actions">
      <button class="interviews-button" @click="visibleCount += PAGE_SIZE">展開更多專訪</button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { buildNewsApiUrl } from '../utils/newsApi.js';
import { formatDate } from '../utils/newsUtils.js';
import config from '../json/data.json';

const props = defineProps({
  initialArticles: { type: Array, default: () => [] },
});

const PAGE_SIZE = 6;
const articles = ref(props.initialArticles);
const visibleCount = ref(PAGE_SIZE);
const visibleArticles = computed(() => articles.value.slice(0, visibleCount.value));
const isLoading = ref(false);
const loadFailed = ref(false);

const refreshArticles = async () => {
  if (isLoading.value) return;
  isLoading.value = true;
  loadFailed.value = false;
  try {
    const response = await fetch(buildNewsApiUrl(config.newsReport.candidateInterviews.api), { cache: 'no-store' });
    if (!response.ok) throw new Error(`專訪 API 回應失敗: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.article_lists)) throw new Error('專訪 API 資料格式錯誤');
    // Preserve the statically rendered articles if the runtime feed is temporarily empty.
    if (data.article_lists.length || !articles.value.length) articles.value = data.article_lists;
  } catch (error) {
    console.error('更新選將專訪失敗:', error);
    loadFailed.value = articles.value.length === 0;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => { void refreshArticles(); });
</script>

<style scoped>
.interviews-section { margin-bottom: 3.5rem; }
.interviews-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.interviews-header h2 { display: flex; align-items: center; gap: 0.5rem; margin: 0; font-size: 2rem; font-weight: 600; color: var(--color-coffee-900); }
.interviews-icon { width: 1em; height: 1em; flex-shrink: 0; color: var(--color-coffee-accent); }
.interviews-divider { flex: 1; height: 1.5px; background: var(--color-coffee-300); }
.interviews-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
.interview-card { display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--color-coffee-200); border-radius: 16px; background: var(--color-coffee-0); color: inherit; text-decoration: none; }
.interview-image-wrap { aspect-ratio: 4 / 3; overflow: hidden; background: var(--color-coffee-50); }
.interview-image-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; transition: transform 0.3s; }
.interview-card:hover img { transform: scale(1.05); }
.interview-body { display: flex; flex-direction: column; flex: 1; padding: 1.25rem; }
.interview-date { color: var(--color-coffee-600); font-size: 0.85rem; }
.interview-body h3 { margin: 0.6rem 0; color: var(--color-coffee-900); font-size: 1.2rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.interview-body p { margin: 0 0 1rem; color: var(--color-coffee-600); line-height: 1.75; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.interview-more { margin-top: auto; align-self: flex-end; color: var(--color-coffee-600); font-size: 1.1rem; font-weight: 900; transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: inline-flex; align-items: center; gap: 2px; position: relative; padding-right: 14px; }
.more-arrow-static { flex-shrink: 0; margin-right: -4px; }
.more-arrow-hover { position: absolute; right: -2px; top: 50%; opacity: 0; transform: translateY(-50%) translateX(-4px); transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
@media (hover: hover) {
  .interview-card:hover .more-arrow-hover { opacity: 1; transform: translateY(-50%) translateX(0); }
}
.interview-card:hover .interview-more { color: var(--color-primary); }
.interviews-status { color: var(--color-coffee-600); padding: 1.5rem 0; }
.interviews-actions { text-align: center; margin-top: 1.5rem; }
.interviews-button { border: 1.5px solid var(--color-primary); border-radius: 50px; padding: 0.7rem 1.5rem; color: var(--color-primary); background: var(--color-coffee-0); font-size: 1rem; font-weight: 700; cursor: pointer; }
.interviews-button:hover { background: var(--color-coffee-50); }
.interviews-button:focus-visible, .interview-card:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 4px; }
@media (max-width: 600px) {
  .interviews-grid { grid-template-columns: minmax(0, 1fr); }
  .interviews-header h2 { font-size: 1.5rem; }
}
</style>
