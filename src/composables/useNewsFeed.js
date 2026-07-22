import { computed, reactive, ref } from 'vue';
import { buildNewsApiUrl, getTagApi, getTagLabel } from '../utils/newsApi.js';

const PROBE_MAX_PAGES = 15;

const NO_YEAR_FILTER_TAGS = new Set([
  '2026縣市長選舉報導',
  '柯文哲選舉新聞',
  '賴清德選舉新聞',
]);

const isFrom2026 = (item) => {
  const pDate = String(item?.pubtime || '').trim();
  const rDate = String(item?.release_date || '').trim();
  const dateStr = pDate || rDate;
  return dateStr.startsWith('2026');
};

const isLastPage = (requestedPage, lastPageFromApi, rawArticlesLength, limit) => {
  if (typeof lastPageFromApi === 'number' && requestedPage >= lastPageFromApi) return true;
  if (typeof limit === 'number' && rawArticlesLength < limit) return true;
  return false;
};

/**
 * @param {Object} initialNews
 * @param {Array} hotTags
 * @param {number} carouselCount
 */
export function useNewsFeed(initialNews, hotTags, carouselCount = 0) {
  const defaultTagLabel = getTagLabel(hotTags[0]);
  const activeTag = ref(defaultTagLabel);
  const isNewsLoading = ref(false);
  const isMoreLoading = ref(false);
  let latestRequestId = 0;

  const apiExhaustedTags = reactive(new Set());

  const nextPageCache = reactive({});

  const getTagByLabel = (label) => {
    const found = hotTags.find(tag => getTagLabel(tag) === label);
    if (!found) {
      console.warn(`[useNewsFeed] 找不到標籤 "${label}"，已回退至預設標籤`);
      return hotTags[0];
    }
    return found;
  };

  const shouldFilterYear = (tagLabel) => !NO_YEAR_FILTER_TAGS.has(tagLabel);

  const fetchRawPage = async (tag, page = 1) => {
    const api = getTagApi(tag);
    if (!api?.tagName) return {};

    const response = await fetch(buildNewsApiUrl(api, page));
    if (!response.ok) throw new Error('無法載入新聞');

    return await response.json();
  };

  const processApiData = (data = {}, tagLabel = defaultTagLabel, limit, requestedPage = 1) => {
    const pageModel = data.page_model || { currentPage: requestedPage, lastPage: requestedPage };
    const rawArticles = Array.isArray(data.article_lists) ? data.article_lists : [];
    const articles = shouldFilterYear(tagLabel) ? rawArticles.filter(isFrom2026) : rawArticles;

    if (isLastPage(requestedPage, pageModel.lastPage, rawArticles.length, limit)) {
      apiExhaustedTags.add(tagLabel);
    }

    return {
      article_lists: articles,
      page_model: pageModel,
      currentPage: requestedPage,
    };
  };

  const newsByTag = reactive({
    [defaultTagLabel]: processApiData(initialNews, defaultTagLabel, getTagApi(hotTags[0])?.limit, 1),
  });

  const activeTagConfig = computed(() => getTagByLabel(activeTag.value));
  const currentNewsState = computed(() => newsByTag[activeTag.value] || processApiData({}, activeTag.value, undefined, 1));
  const newsList = computed(() => currentNewsState.value.article_lists);
  const filterTags = computed(() => hotTags.slice(1).map(getTagLabel).filter(Boolean));

  const visibleNews = computed(() => {
    if (activeTag.value === defaultTagLabel) return newsList.value.slice(carouselCount);
    return newsList.value;
  });

  const hasMoreNews = computed(() => {
    if (apiExhaustedTags.has(activeTag.value)) return false;
    return Boolean(getTagApi(activeTagConfig.value)?.tagName);
  });

 
  const probeForward = async ({ tag, tagLabel, limit, existingIds, startPage, maxPages }) => {
    const shouldFilter = shouldFilterYear(tagLabel);
    let page = startPage;

    for (let pagesChecked = 0; pagesChecked < maxPages; pagesChecked += 1) {
      page += 1;

      let rawData;
      try {
        rawData = await fetchRawPage(tag, page);
      } catch (error) {
        console.error('預先偵測新聞出錯:', error);
        return { exhausted: true };
      }

      const pageModel = rawData?.page_model || {};
      const rawArticles = Array.isArray(rawData?.article_lists) ? rawData.article_lists : [];
      const filtered = shouldFilter ? rawArticles.filter(isFrom2026) : rawArticles;
      const newItems = filtered.filter(item => !existingIds.has(item.article_id));

      if (newItems.length > 0) {
        return { exhausted: false, items: newItems, page, pageModel, rawArticlesLength: rawArticles.length };
      }

      if (isLastPage(page, pageModel.lastPage, rawArticles.length, limit)) {
        return { exhausted: true };
      }

      if (shouldFilter && rawArticles.length > 0 && filtered.length === 0) {
        return { exhausted: true };
      }
    }

    return { exhausted: true, items: null, reachedMaxPages: true };
  };

  const applyProbeResult = (tagLabel, peek) => {
    if (peek.exhausted) {
      apiExhaustedTags.add(tagLabel);
      delete nextPageCache[tagLabel];
    } else if (peek.items) {
      nextPageCache[tagLabel] = {
        page: peek.page,
        pageModel: peek.pageModel,
        rawArticlesLength: peek.rawArticlesLength,
        items: peek.items,
      };
    }
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
      const limit = getTagApi(tag)?.limit;
      const rawData = await fetchRawPage(getTagByLabel(nextTagLabel), 1);

      if (requestId !== latestRequestId) return;

      const state = processApiData(rawData, nextTagLabel, limit, 1);
      newsByTag[nextTagLabel] = state;

      if (!apiExhaustedTags.has(nextTagLabel)) {
        const existingIds = new Set(state.article_lists.map(item => item.article_id));
        const peek = await probeForward({
          tag: getTagByLabel(nextTagLabel),
          tagLabel: nextTagLabel,
          limit,
          existingIds,
          startPage: state.currentPage,
          maxPages: PROBE_MAX_PAGES,
        });

        if (requestId === latestRequestId) {
          applyProbeResult(nextTagLabel, peek);
        }
      }
    } catch (error) {
      console.error('切換新聞標籤出錯:', error);
      if (requestId === latestRequestId) {
        newsByTag[nextTagLabel] = processApiData({}, nextTagLabel, undefined, 1);
        apiExhaustedTags.add(nextTagLabel);
      }
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
    const tagLabel = activeTag.value;
    const tag = activeTagConfig.value;
    const limit = getTagApi(tag)?.limit;

    try {
      const cached = nextPageCache[tagLabel];
      let result;

      if (cached) {
        delete nextPageCache[tagLabel];
        result = { exhausted: false, ...cached };
      } else {
        const existingIds = new Set(state.article_lists.map(item => item.article_id));
        result = await probeForward({
          tag, tagLabel, limit, existingIds,
          startPage: state.currentPage,
          maxPages: PROBE_MAX_PAGES,
        });
      }

      if (result.exhausted) {
        apiExhaustedTags.add(tagLabel);
        return;
      }

      if (!result.items) {
        return;
      }

      state.article_lists.push(...result.items);
      state.page_model = result.pageModel;
      state.currentPage = result.page;

      if (isLastPage(result.page, result.pageModel.lastPage, result.rawArticlesLength, limit)) {
        apiExhaustedTags.add(tagLabel);
        return;
      }

      const existingIdsAfter = new Set(state.article_lists.map(item => item.article_id));
      const peek = await probeForward({
        tag, tagLabel, limit,
        existingIds: existingIdsAfter,
        startPage: result.page,
        maxPages: PROBE_MAX_PAGES,
      });

      applyProbeResult(tagLabel, peek);
    } catch (error) {
      console.error('展開更多新聞出錯:', error);
      apiExhaustedTags.add(tagLabel);
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