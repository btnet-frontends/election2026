import parties from '../json/parties.json' with { type: 'json' };

export const INVOICING_RESULT_URL = 'https://doqvf81n9htmm.cloudfront.net/files/2026election/getInvoicingResult';
const partyById = new Map(parties.map((party) => [String(party.id), party]));
const badges = { 中國國民黨: '國', 民主進步黨: '民', 台灣民眾黨: '眾', 無黨籍及未經政黨推薦: '無' };
const normalizeCity = (name) => String(name ?? '').trim().replaceAll('臺', '台');
const isTrue = (value) => value === true || value === 1 || value === '1' || value === 'true';

const toNumber = (value) => {
  if (value == null || String(value).trim() === '') return null;
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const number = Number(String(value).replaceAll(',', '').replace(/%$/, ''));
  return Number.isFinite(number) && number >= 0 ? number : null;
};

export function normalizeInvoicingResult(data) {
  if (!Array.isArray(data?.aInvoicingResult)) throw new Error('開票資料格式不正確');
  const cities = {};
  for (const city of data.aInvoicingResult) {
    if (!city?.City) continue;
    cities[normalizeCity(city.City)] = (Array.isArray(city.Candidate) ? city.Candidate : [])
      .filter((candidate) => candidate?.Name && ![false, 0, '0', 'false'].includes(candidate.Is_show_main_page))
      .map((candidate, index) => {
        const party = partyById.get(String(candidate.Political_party_id));
        const partyName = party?.name || candidate.Political_party || '無黨籍及未經政黨推薦';
        return {
          id: `${city.City_id || normalizeCity(city.City)}-${candidate.Number ?? index}`,
          name: candidate.Name,
          party: partyName,
          partyImage: party?.image || null,
          shortName: badges[partyName] || partyName.slice(0, 1),
          color: party?.color || '#888888',
          votes: toNumber(candidate.Votes),
          percent: toNumber(candidate.Percentage ?? candidate['Percentage ']),
          elected: isTrue(candidate.Elected)
        };
      });
  }
  return { cities, updateTime: data.dDataTime || data.dBTUpdateDataTime || '' };
}

export async function fetchInvoicingResult(url = INVOICING_RESULT_URL, signal = AbortSignal.timeout(10000)) {
  const response = await fetch(url, { signal, cache: 'no-cache' });
  if (!response.ok) throw new Error(`開票 API 回應 ${response.status}`);
  return normalizeInvoicingResult(await response.json());
}
