const MAYOR_HISTORY_URL = 'https://doqvf81n9htmm.cloudfront.net/2026election/files/getMayorHistory';

// API 縣市名稱（用「臺」）→ 地圖元件的 data-name slug
const CITY_SLUGS = {
  臺北市: 'taipei_city',
  新北市: 'newtaipei_city',
  桃園市: 'taoyuan_city',
  臺中市: 'taichung_city',
  臺南市: 'tainan_city',
  高雄市: 'kaohsiung_city',
  基隆市: 'keelung_city',
  新竹市: 'hsinchu_city',
  嘉義市: 'chiayi_city',
  新竹縣: 'hsinchu_county',
  苗栗縣: 'miaoli_county',
  彰化縣: 'changhua_county',
  南投縣: 'nantou_county',
  雲林縣: 'yunlin_county',
  嘉義縣: 'chiayi_county',
  屏東縣: 'pingtung_county',
  宜蘭縣: 'yilan_county',
  花蓮縣: 'hualien_county',
  臺東縣: 'taitung_county',
  澎湖縣: 'penghu_county',
  金門縣: 'kinmen_county',
  連江縣: 'lianjiang_county'
};

// 當選人政黨 → partyHistory.parties 的 key；有當選人但政黨未列出者歸為無黨籍
const PARTY_KEYS = {
  中國國民黨: 'kmt',
  民主進步黨: 'dpp',
  台灣民眾黨: 'tpp',
  無黨籍及未經政黨推薦: 'independent'
};

const toSlug = (cityName) => CITY_SLUGS[String(cityName).replace(/^台/, '臺')] ?? null;

const normalizeMayorHistory = (historyJson) => {
  if (!Array.isArray(historyJson?.elections)) return null;

  const results = {};
  const years = [];

  historyJson.elections.forEach((election) => {
    const { year } = election;
    if (!year || !Array.isArray(election.results)) return;

    const yearResults = {};
    election.results.forEach((result) => {
      const slug = toSlug(result.prvCityName);
      if (!slug) return;

      // 尚無當選人資料的縣市直接略過，地圖會顯示灰色與「尚無資料」，不誤標成無黨籍
      const winnerParty = result.winner?.party;
      if (!winnerParty) return;

      yearResults[slug] = PARTY_KEYS[winnerParty] ?? 'independent';
    });

    if (Object.keys(yearResults).length > 0) {
      years.push(year);
      results[String(year)] = yearResults;
    }
  });

  return years.length > 0 ? { years: years.sort((a, b) => a - b), results } : null;
};

/**
 * 抓取歷屆縣市首長選舉結果（直轄市長 + 縣市長，中選會資料）。
 * 於 Astro build 階段呼叫；失敗時回傳 null，元件會退回 data.json 的內建資料。
 */
export async function fetchMayorHistory() {
  try {
    const response = await fetch(MAYOR_HISTORY_URL+'?v='+new Date());
    if (!response.ok) {
      throw new Error(`縣市首長歷史 API 回應 ${response.status}`);
    }

    return normalizeMayorHistory(await response.json());
  } catch (error) {
    console.error('Astro 靜態抓取縣市首長歷史資料發生異常:', error);
    return null;
  }
}
