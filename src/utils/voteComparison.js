const positiveVotes = (value) => {
  const votes = Number(value);
  return Number.isFinite(votes) && votes > 0 ? votes : 0;
};

export const getVoteMaximum = (candidates) => candidates.reduce(
  (maximum, candidate) => Math.max(maximum, positiveVotes(candidate.votes)),
  0
);

// Constituencies are scoped by office type and city. Village chiefs also need
// township + village; representatives need township + constituency.
export const getVoteComparisonKey = (candidate) => {
  const type = Number(candidate.candidateType);
  const city = candidate.prvCityCode;
  if (!city) return null;
  let codes;
  if ([1, 2, 3].includes(type)) codes = [candidate.areaCode];
  else if (type === 4) codes = [candidate.deptCode, candidate.liCode];
  else if (type === 5) codes = [candidate.deptCode];
  else if ([6, 7, 8].includes(type)) codes = [candidate.deptCode, candidate.areaCode];
  else return null;
  return codes.every((code) => code != null && String(code).trim() !== '')
    ? JSON.stringify([type, city, ...codes]) : null;
};

export const getConstituencyVoteMaxima = (candidates) => {
  const maxima = new Map();
  for (const candidate of candidates) {
    const key = getVoteComparisonKey(candidate);
    if (key) maxima.set(key, Math.max(maxima.get(key) ?? 0, positiveVotes(candidate.votes)));
  }
  return maxima;
};

export const groupCandidatesByConstituency = (candidates) => {
  const groups = new Map();
  for (const candidate of candidates) {
    const key = getVoteComparisonKey(candidate) ?? JSON.stringify([
      candidate.candidateType, candidate.locationText, candidate.areaDeptsText
    ]);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        locationText: candidate.locationText || '參選地區待更新',
        areaDeptsText: candidate.areaDeptsText,
        candidateTypeName: candidate.candidateTypeName,
        candidates: []
      });
    }
    groups.get(key).candidates.push(candidate);
  }
  return [...groups.values()];
};

export const getVoteBarWidth = (votes, maximum) => {
  const scale = positiveVotes(maximum);
  return scale > 0 ? Math.min(100, positiveVotes(votes) / scale * 100) : 0;
};
