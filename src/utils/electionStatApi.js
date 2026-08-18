const ELECTION_STAT_URL = 'https://lazybusiness.s3.ap-northeast-1.amazonaws.com/2026election/getElectionStat';

const PARTY_TREND_KEY = '國、民兩黨20年來重要選舉得票率';
const TURNOUT_KEY = '2008年以來台灣重要選舉投票率';
const MUNICIPALITY_KEY_PATTERN = /^(\d{4})年直轄市長選舉各政黨候選人得票率$/;

const round2 = (value) => Math.round(Number(value) * 100) / 100;

// "2014年直轄市長、縣市長" → { year: '2014年', election: '直轄市長、\n縣市長' }
// 「、」後補換行讓 x 軸標籤斷成兩行，與 data.json 既有格式一致
const parseCategory = (label) => {
  const match = String(label).match(/^(\d{4}年)(.*)$/);
  return match
    ? { year: match[1], election: match[2].replace('、', '、\n') }
    : { year: String(label), election: '' };
};

const normalizePartyTrend = (raw) => {
  if (!raw?.years || !raw['國民黨'] || !raw['民進黨']) return null;

  return {
    categories: raw.years.map(parseCategory),
    series: [
      { id: 'kmt', name: '國民黨', values: raw['國民黨'] },
      { id: 'dpp', name: '民進黨', values: raw['民進黨'] }
    ]
  };
};

const normalizeTurnout = (raw) => {
  if (!Array.isArray(raw?.data)) return null;

  return {
    items: raw.data.map(({ election, turnout }) => ({
      label: election,
      value: turnout
    }))
  };
};

const normalizeMunicipalityYears = (statJson) => {
  const years = {};

  Object.entries(statJson).forEach(([key, block]) => {
    const match = key.match(MUNICIPALITY_KEY_PATTERN);
    if (!match || !block?.cities) return;

    years[match[1]] = Object.entries(block.cities).map(([city, parties]) => ({
      city,
      kmt: round2(parties['國民黨'] ?? 0),
      dpp: round2(parties['民進黨'] ?? 0),
      other: round2(parties['無黨籍及未經政黨推薦'] ?? 0)
    }));
  });

  return Object.keys(years).length > 0 ? years : null;
};

/**
 * 抓取投票分析統計（兩黨得票率趨勢、歷年投票率、直轄市長得票率）。
 * 於 Astro build 階段呼叫；失敗時回傳 null，元件會退回 data.json 的內建資料。
 */
export async function fetchElectionStat() {
  try {
    const response = await fetch(ELECTION_STAT_URL);
    if (!response.ok) {
      throw new Error(`投票分析 API 回應 ${response.status}`);
    }

    const statJson = await response.json();

    return {
      partyTrend: normalizePartyTrend(statJson[PARTY_TREND_KEY]),
      turnout: normalizeTurnout(statJson[TURNOUT_KEY]),
      municipalityYears: normalizeMunicipalityYears(statJson)
    };
  } catch (error) {
    console.error('Astro 靜態抓取投票分析資料發生異常:', error);
    return null;
  }
}
