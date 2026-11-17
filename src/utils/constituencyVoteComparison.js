import { fetchElectionSearch, SEARCH_MODE } from './electionSearchApi.js';
import { getConstituencyVoteMaxima, getVoteComparisonKey } from './voteComparison.js';

const getComparisonQuery = (candidate) => {
  if (!getVoteComparisonKey(candidate)) return null;
  const candidateType = Number(candidate.candidateType);
  const query = { searchMode: SEARCH_MODE.office, candidateType, prvCityCode: candidate.prvCityCode };
  if ([1, 2, 3, 6, 7, 8].includes(candidateType)) query.areaCode = candidate.areaCode;
  if ([4, 5, 6, 7, 8].includes(candidateType)) query.deptCode = candidate.deptCode;
  if (candidateType === 4) query.liCode = candidate.liCode;
  return query;
};

// One cache per applied search: page navigation reuses the full constituency
// benchmark, while a new search refreshes it. Party/name/elected filters must
// not hide opponents from the comparison request.
export function createVoteComparisonLoader(fetchCandidates = fetchElectionSearch) {
  const scopes = new Map();
  return async (candidates) => {
    const queries = new Map();
    for (const candidate of candidates) {
      const query = getComparisonQuery(candidate);
      if (query) queries.set(JSON.stringify(query), query);
    }
    const results = await Promise.all([...queries].map(async ([key, query]) => {
      if (!scopes.has(key)) {
        const request = Promise.resolve().then(async () => {
          const first = await fetchCandidates({ ...query, page: 1, pageSize: 100 });
          const allCandidates = [...first.candidates];
          if (first.total > allCandidates.length) {
            // Respect the server's effective page size if it caps our request.
            const pageSize = first.pageSize || first.candidates.length;
            if (!(pageSize > 0)) throw new Error('選區比較資料不完整');
            const pages = await Promise.all(Array.from(
              { length: Math.ceil(first.total / pageSize) - 1 },
              (_, index) => fetchCandidates({ ...query, page: index + 2, pageSize })
            ));
            allCandidates.push(...pages.flatMap((page) => page.candidates));
            if (allCandidates.length < Math.max(first.total, ...pages.map((page) => page.total))) {
              throw new Error('選區比較資料不完整');
            }
          }
          return getConstituencyVoteMaxima(allCandidates);
        }).catch((error) => {
          scopes.delete(key);
          throw error;
        });
        scopes.set(key, request);
      }
      try {
        return await scopes.get(key);
      } catch (error) {
        console.error('載入選區票數比較失敗', error);
        return new Map();
      }
    }));
    return new Map(results.flatMap((maxima) => [...maxima]));
  };
}
