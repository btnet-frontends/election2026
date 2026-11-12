const positiveVotes = (value) => {
  const votes = Number(value);
  return Number.isFinite(votes) && votes > 0 ? votes : 0;
};

export const getPageVoteMaximum = (candidates) => candidates.reduce(
  (maximum, candidate) => Math.max(maximum, positiveVotes(candidate.votes)),
  0
);

export const getVoteBarWidth = (votes, maximum) => {
  const scale = positiveVotes(maximum);
  return scale > 0 ? Math.min(100, positiveVotes(votes) / scale * 100) : 0;
};
