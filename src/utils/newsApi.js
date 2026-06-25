const NEWS_API_ENDPOINT = 'https://www.businesstoday.com.tw/tag/toJson/';

export const getTagLabel = (tag) => {
  return typeof tag === 'string' ? tag : tag?.label || '';
};

export const getTagApi = (tag) => {
  return typeof tag === 'string' ? null : tag?.api || null;
};

export const buildNewsApiUrl = (api, page = 1) => {
  const params = new URLSearchParams({
    name: api?.tagName || '',
    limit: String(api?.limit || 10),
  });

  if (page > 1) {
    params.set('page', String(page));
  }

  return `${NEWS_API_ENDPOINT}?${params.toString()}`;
};
