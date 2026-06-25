import { computed, reactive, ref } from 'vue';
import { buildNewsApiUrl, getTagApi, getTagLabel } from '../utils/newsApi.js';

/**
 * @param {Object} initialNews  
 * @param {Array} hotTags
 */
export function useNewsFeed(initialNews, hotTags, carouselCount = 0) {
  const defaultTagLabel = getTagLabel(hotTags[0]);
  const activeTag = ref(defaultTagLabel);
  const isNewsLoading = ref(false);
  const isMoreLoading = ref(false);
  let latestRequestId = 0;

  const normalizeNewsData = (data = {}) => {
    const pageModel = data.page_model || { currentPage: 1, lastPage: 1 };

    return {
      article_lists: Array.isArray(data.article_lists) ? data.article_lists : [],
      page_model: pageModel,
      currentPage: pageModel.currentPage || 1,
    };
  };

  const newsByTag = reactive({
    [defaultTagLabel]: normalizeNewsData(initialNews),
  });

  const getTagByLabel = (label) => {
    return hotTags.find(tag => getTagLabel(tag) === label) || hotTags[0];
  };

  const activeTagConfig = computed(() => getTagByLabel(activeTag.value));
  const currentNewsState = computed(() => {
    return newsByTag[activeTag.value] || normalizeNewsData();
  });

  const newsList = computed(() => currentNewsState.value.article_lists);

  const filterTags = computed(() => hotTags.slice(1).map(getTagLabel).filter(Boolean));

  const visibleNews = computed(() => {
    if (activeTag.value === defaultTagLabel) return newsList.value.slice(carouselCount);
    return newsList.value;
  });

  const hasMoreNews = computed(() => {
    const pageModel = currentNewsState.value.page_model || {};
    const lastPage = pageModel.lastPage || 1;
    return Boolean(getTagApi(activeTagConfig.value)?.tagName) && currentNewsState.value.currentPage < lastPage;
  });

  const fetchTagNews = async (tag, page = 1) => {
    const api = getTagApi(tag);
    if (!api?.tagName) return normalizeNewsData();

    const response = await fetch(buildNewsApiUrl(api, page));
    if (!response.ok) throw new Error('無法載入新聞');

    return normalizeNewsData(await response.json());
  };

  const selectTag = async (tag) => {
    const nextTagLabel = getTagLabel(tag);
    if (activeTag.value === nextTagLabel) return;

    latestRequestId += 1;
    activeTag.value = nextTagLabel;

    if (newsByTag[nextTagLabel]) {
      isNewsLoading.value = false;
      return;
    }

    const requestId = latestRequestId;
    isNewsLoading.value = true;

    try {
      newsByTag[nextTagLabel] = await fetchTagNews(getTagByLabel(nextTagLabel));
    } catch (error) {
      console.error('切換新聞標籤出錯:', error);
      newsByTag[nextTagLabel] = normalizeNewsData();
    } finally {
      if (requestId === latestRequestId) {
        isNewsLoading.value = false;
      }
    }
  };

  const loadMore = async () => {
    if (isMoreLoading.value || !hasMoreNews.value) return;
    isMoreLoading.value = true;

    const state = currentNewsState.value;
    const nextPage = state.currentPage + 1;

    try {
      const data = await fetchTagNews(activeTagConfig.value, nextPage);

      if (data?.article_lists?.length > 0) {
        const existingIds = new Set(state.article_lists.map(item => item.article_id));
        state.article_lists.push(
          ...data.article_lists.filter(item => !existingIds.has(item.article_id))
        );
        state.page_model = data.page_model;
        state.currentPage = data.page_model.currentPage || nextPage;
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
