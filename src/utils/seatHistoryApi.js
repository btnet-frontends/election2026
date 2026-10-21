import { fetchStatisticsJson } from './statisticsApi.js';
import parties from '../json/parties.json' with { type: 'json' };

// API 的政黨名稱與色票表（parties.json）名稱不一致時的對照
const COLOR_NAME_ALIASES = {
  綠黨: '台灣綠黨',
  台灣團結聯盟: '台聯黨'
};

// 政黨名稱 → 代表色（來源：政黨色票 Google Sheet 匯出的 parties.json）
const PARTY_COLORS = Object.fromEntries(
  parties
    .filter((party) => party.color)
    .map((party) => [party.name, party.color])
);

const resolvePartyColor = (partyName) => (
  PARTY_COLORS[partyName] ?? PARTY_COLORS[COLOR_NAME_ALIASES[partyName]] ?? null
);

const normalizeHistory = (historyJson) => {
  const years = Object.keys(historyJson)
    .filter((key) => /^\d{4}$/.test(key))
    .map(Number)
    .sort((a, b) => b - a);

  const data = Object.fromEntries(years.map((year) => [
    year,
    Object.fromEntries(Object.entries(historyJson[String(year)]).map(([city, cityData]) => [
      city,
      {
        totalSeats: cityData.total_seats,
        parties: Object.entries(cityData.parties).map(([name, party]) => ({
          name,
          seats: party.seats,
          voteRate: party.vote_rate,
          color: resolvePartyColor(name)
        }))
      }
    ]))
  ]));

  return { years, data, source: historyJson.metadata?.source ?? null };
};

/**
 * 抓取各縣市議員席次歷史（中選會資料）並套上政黨代表色。
 * 供 Astro build 與瀏覽器自動更新共用；失敗時回傳 null。
 */
export async function fetchSeatHistory(signal) {
  try {
    const json = await fetchStatisticsJson('getParliamentaryHistory', signal);

    return normalizeHistory(json);
  } catch (error) {
    if (!signal?.aborted) console.error('抓取議員席次資料發生異常:', error);
    return null;
  }
}
