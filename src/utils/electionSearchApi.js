// export const ELECTION_SEARCH_URL = 'http://localhost/api/Election2026_search';
export const ELECTION_SEARCH_URL = 'https://webtest-kenny.businesstoday.com.tw/api/election2026_search';

export const SEARCH_MODE = { office: 1, name: 2, party: 3 };

const toNumber = (value) => {
  const number = Number(value);
  return value != null && value !== '' && Number.isFinite(number) ? number : null;
};

/**
 * 組出查詢參數；未提供的選填欄位不送出。
 * @param {object} query
 * @param {1|2|3} query.searchMode 1 公職類型+縣市+鄉鎮市區、2 姓名、3 政黨
 * @param {number|string} [query.candidateType] searchMode 1：1~8
 * @param {string} [query.prvCityCode] searchMode 1：例 63-000
 * @param {string} [query.deptCode] searchMode 1：例 010；省略 = 整個縣市
 * @param {string} [query.name] searchMode 2：姓名（模糊比對）
 * @param {string} [query.party] searchMode 3：政黨名稱
 * @param {boolean} [query.onlyElected] 只看當選
 * @param {number} [query.page] 頁數
 * @param {number} [query.pageSize] 每頁筆數
 */
export function buildElectionSearchPayload(query) {
  const payload = { searchMode: query.searchMode };

  if (query.searchMode === SEARCH_MODE.office) {
    payload.candidateType = query.candidateType;
    payload.prvCityCode = query.prvCityCode;
    if (query.deptCode) payload.deptCode = query.deptCode;
  } else if (query.searchMode === SEARCH_MODE.name) {
    payload.name = String(query.name ?? '').trim();
  } else if (query.searchMode === SEARCH_MODE.party) {
    payload.party = query.party;
  }

  if (query.onlyElected) payload.onlyElected = 1;
  if (query.page != null) {
    payload.page = query.page;
    if (query.pageSize != null) payload.pageSize = query.pageSize;
  }

  return payload;
}

export function normalizeElectionSearch(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('開票結果搜尋資料格式不正確');
  }
  // 失敗時 searchResult 可能為 null，需先判斷才不會蓋掉後端的 sError
  if (data.bIsSuccess === false || data.sError) {
    throw new Error(String(data.sError || '開票結果搜尋失敗'));
  }
  if (!Array.isArray(data.searchResult)) {
    throw new Error('開票結果搜尋資料格式不正確');
  }

  return {
    candidates: data.searchResult.map((candidate) => ({
      // API 沒有候選人唯一代號，以選舉類型 + 各層選區代碼 + 號次組成
      id: [
        candidate.CandidateType,
        candidate.PrvCityCode,
        candidate.AreaCode,
        candidate.DeptCode,
        candidate.LiCode,
        candidate.Number
      ].join('-'),
      candidateType: toNumber(candidate.CandidateType),
      candidateTypeName: candidate.CandidateTypeName || '',
      prvCityCode: candidate.PrvCityCode || '',
      cityName: candidate.CityName || '',
      areaCode: candidate.AreaCode || '',
      areaName: candidate.AreaName || '',
      // 後端組好的卡片地區文字，例「臺北市・第1選舉區」
      locationText: candidate.LocationText || '',
      // 後端組好的議員選區涵蓋行政區，例「士林區、 北投區」；其他類型為空字串
      areaDeptsText: candidate.AreaDeptsText || '',
      deptCode: candidate.DeptCode || '',
      deptName: candidate.DeptName || '',
      liCode: candidate.LiCode || '',
      liName: candidate.LiName || '',
      number: toNumber(candidate.Number),
      name: candidate.Name || '',
      partyId: toNumber(candidate.PartyId),
      party: candidate.Political_party || '',
      votes: toNumber(candidate.Votes),
      percent: toNumber(candidate.Percentage),
      elected: candidate.Elected === true
    })),
    total: toNumber(data.iTotal) ?? data.searchResult.length,
    // 未分頁時後端回傳 null
    page: toNumber(data.iPage),
    pageSize: toNumber(data.iPageSize),
    updateTime: data.dDataTime || data.dBTUpdateDataTime || ''
  };
}

// 舊版瀏覽器（iOS Safari 16 以下、部分 App 內建瀏覽器）沒有 AbortSignal.timeout
const createTimeoutSignal = (ms) => {
  if (typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(ms);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};

export async function fetchElectionSearch(query, { url = ELECTION_SEARCH_URL, signal = createTimeoutSignal(10000) } = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildElectionSearchPayload(query)),
    signal
  });
  if (!response.ok) throw new Error(`開票結果搜尋 API 回應 ${response.status}`);
  return normalizeElectionSearch(await response.json());
}
