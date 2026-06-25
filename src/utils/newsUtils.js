/**
 * 日期格式化：將 "2026-01-01 00:00:00" 轉為 "2026.01.01"
 * @param {string} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split(' ')[0].replace(/-/g, '.');
};

/**
 * 將文章列表整理成快訊輪播資料
 * @param {Object[]} items
 * @param {number} limit
 * @returns {{ text: string, date: string, link: string }[]}
 */
export const buildFlashNewsList = (items = [], limit = 4) => {
  if (!Array.isArray(items)) return [];

  return items.slice(0, limit).map((item) => ({
    text: item.title || '',
    date: formatDate(item.pubtime),
    link: item.output_link_path || '',
  })).filter(item => item.text);
};

/**
 * 從文章資料萃取標籤（最多 3 個）
 * @param {Object} item - 文章物件
 * @param {string[]} hotTags - 熱門標籤陣列（不含「全部戰報」）
 * @returns {string[]}
 */
export const getItemTags = (item, hotTags) => {
  const tags = [];
  if (item.category_info?.name) tags.push(item.category_info.name);
  for (const tag of hotTags) {
    if (tags.length >= 3) break;
    if (
      tag !== item.category_info?.name &&
      (item.title?.includes(tag) || item.part_text?.includes(tag))
    ) {
      tags.push(tag);
    }
  }
  return tags;
};
