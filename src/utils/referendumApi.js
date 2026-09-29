export const REFERENDUM_URL = 'https://doqvf81n9htmm.cloudfront.net/files/2026election/getReferendum';

export function normalizeReferendum(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('公投資料格式不正確');
  }
  if (data.sError) throw new Error(String(data.sError));

  for (const field of ['fAgreeRate', 'fDisagreeRate', 'iAgreeTks', 'iDisagreeTks']) {
    const value = data[field];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0
      || (field.startsWith('f') ? value > 100 : !Number.isSafeInteger(value))) {
      throw new Error(`公投資料格式不正確：${field}`);
    }
  }
  if (typeof data.bIsPass !== 'boolean') throw new Error('公投資料格式不正確：bIsPass');

  return {
    status: data.bIsPass ? 'passed' : 'failed',
    results: {
      agree: { percentage: data.fAgreeRate, votes: data.iAgreeTks },
      disagree: { percentage: data.fDisagreeRate, votes: data.iDisagreeTks }
    },
    updateTime: data.dDataTime || data.dBTUpdateDataTime || ''
  };
}

export async function fetchReferendum(url = REFERENDUM_URL, signal = AbortSignal.timeout(10000)) {
  const response = await fetch(url, { signal, cache: 'no-cache' });
  if (!response.ok) throw new Error(`公投 API 回應 ${response.status}`);
  return normalizeReferendum(await response.json());
}
