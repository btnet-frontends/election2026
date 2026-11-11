export const REFERENDUM_URL = 'https://download.businesstoday.com.tw/files/2026election/uat/getReferendum';

export function normalizeReferendum(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('公投資料格式不正確');
  }
  if (data.sError) throw new Error(String(data.sError));

  for (const field of ['iAgreeTks', 'iDisagreeTks']) {
    const value = data[field];
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error(`公投資料格式不正確：${field}`);
    }
  }
  if (typeof data.bIsPass !== 'boolean') throw new Error('公投資料格式不正確：bIsPass');
  const totalElectors = Number.isSafeInteger(data.iGmeb) && data.iGmeb > 0 ? data.iGmeb : null;
  const percentageOfElectors = (votes) => totalElectors === null ? null : votes / totalElectors * 100;

  return {
    status: data.bIsPass ? 'passed' : 'failed',
    totalElectors,
    thresholdVotes: totalElectors === null ? null : Math.ceil(totalElectors / 4),
    results: {
      agree: { percentage: percentageOfElectors(data.iAgreeTks), votes: data.iAgreeTks },
      disagree: { percentage: percentageOfElectors(data.iDisagreeTks), votes: data.iDisagreeTks }
    },
    updateTime: data.dDataTime || data.dBTUpdateDataTime || ''
  };
}

export async function fetchReferendum(url = REFERENDUM_URL, signal = AbortSignal.timeout(10000)) {
  const response = await fetch(url, { signal, cache: 'no-cache' });
  if (!response.ok) throw new Error(`公投 API 回應 ${response.status}`);
  return normalizeReferendum(await response.json());
}
