import { ref, computed } from 'vue';
import config from '../json/data.json';

/**
 * @param {Object} initialNews  
 * @param {string[]} hotTags   
 */
export function useNewsFeed(initialNews, hotTags, carouselCount = 3) {
  const newsList = ref(initialNews.article_lists || []);
  const page_model = ref(initialNews.page_model || { currentPage: 1, lastPage: 1 });
  const currentPage = ref(1);

const activeTag = ref(hotTags[0]);
  const isNewsLoading = ref(false);
  const isMoreLoading = ref(false);

  const filterTags = computed(() => hotTags.slice(1));

  const visibleNews = computed(() => {
    if (activeTag.value === hotTags[0]) return newsList.value.slice(carouselCount);
    return newsList.value.filter(item =>
      item.title?.includes(activeTag.value) ||
      item.part_text?.includes(activeTag.value) ||
      (item.category_info?.name && item.category_info.name.includes(activeTag.value))
    );
  });

  const hasMoreNews = computed(() => {
    if (activeTag.value !== hotTags[0]) return false;
    return currentPage.value < (page_model.value.lastPage || 5);
  });

  const selectTag = async (tag) => {
    if (activeTag.value === tag) return;
    activeTag.value = tag;
    isNewsLoading.value = true;
    setTimeout(() => { isNewsLoading.value = false; }, 600);
  };

  const loadMore = async () => {
    if (isMoreLoading.value) return;
    isMoreLoading.value = true;
    const nextPage = currentPage.value + 1;
    try {
      const response = await fetch(
        `https://www.businesstoday.com.tw/tag/toJson/?name=${config.api.tagName}&limit=${config.api.limit}&page=${nextPage}`
      );
      if (!response.ok) throw new Error('無法載入新聞');
      const data = await response.json();
      if (data?.article_lists?.length > 0) {
        const existingIds = new Set(newsList.value.map(item => item.article_id));
        newsList.value.push(
          ...data.article_lists.filter(item => !existingIds.has(item.article_id))
        );
        currentPage.value = nextPage;
      }
    } catch (error) {
      console.error('展開更多新聞出錯:', error);
    } finally {
      isMoreLoading.value = false;
    }
  };

  return {
    newsList,
    activeTag,
    isNewsLoading,
    isMoreLoading,
    filterTags,
    visibleNews,
    hasMoreNews,
    selectTag,
    loadMore,
  };
}
