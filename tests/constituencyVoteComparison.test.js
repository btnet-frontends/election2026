import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoteComparisonLoader } from '../src/utils/constituencyVoteComparison.js';
import { getVoteComparisonKey } from '../src/utils/voteComparison.js';

const candidate = { candidateType: 1, prvCityCode: '63-000', areaCode: '01', votes: 1000, party: '甲', elected: true };

test('comparison fetches every server page without party/name/elected filters and caches across display pages', async () => {
  const queries = [];
  const load = createVoteComparisonLoader(async (query) => {
    queries.push(query);
    return { total: 2, pageSize: 1, candidates: [{ ...candidate, votes: query.page === 1 ? 1000 : 5000, party: query.page === 1 ? '甲' : '乙' }] };
  });
  const first = await load([candidate]);
  assert.equal(first.get(getVoteComparisonKey(candidate)), 5000);
  const next = await load([{ ...candidate, votes: 5000 }]);
  assert.equal(next.get(getVoteComparisonKey(candidate)), 5000);
  assert.deepEqual(queries, [
    { searchMode: 1, candidateType: 1, prvCityCode: '63-000', areaCode: '01', page: 1, pageSize: 100 },
    { searchMode: 1, candidateType: 1, prvCityCode: '63-000', areaCode: '01', page: 2, pageSize: 1 }
  ]);
});

test('village benchmarks send liCode and cache each village independently', async () => {
  const queries = [];
  const village = { candidateType: 4, prvCityCode: '63-000', deptCode: '010', liCode: '002', votes: 200 };
  const other = { ...village, liCode: '003', votes: 10000 };
  const load = createVoteComparisonLoader(async (query) => {
    queries.push(query);
    assert.equal(query.deptCode, '010');
    assert.ok(['002', '003'].includes(query.liCode));
    return query.liCode === '002'
      ? { total: 2, candidates: [village, { ...village, votes: 100 }] }
      : { total: 1, candidates: [other] };
  });
  const maxima = await load([village, other]);
  assert.equal(maxima.get(getVoteComparisonKey(village)), 200);
  assert.equal(maxima.get(getVoteComparisonKey(other)), 10000);
  await load([other]);
  assert.equal(queries.length, 2);
  assert.deepEqual(queries.map((query) => query.liCode).sort(), ['002', '003']);
});

test('representative comparisons carry township and area codes', async () => {
  const representative = { ...candidate, candidateType: 6, deptCode: '010' };
  const load = createVoteComparisonLoader(async (query) => {
    assert.equal(query.candidateType, 6);
    assert.equal(query.areaCode, '01');
    assert.equal(query.deptCode, '010');
    return { total: 1, candidates: [representative] };
  });
  assert.equal((await load([representative])).get(getVoteComparisonKey(representative)), 1000);
});

test('comparison failures leave other constituencies usable and can be retried', async (t) => {
  t.mock.method(console, 'error', () => {});
  let fail = true;
  const load = createVoteComparisonLoader(async (query) => {
    if (query.areaCode === '01' && fail) throw new Error('network');
    return { total: 1, candidates: [{ ...candidate, areaCode: query.areaCode }] };
  });
  const other = { ...candidate, areaCode: '02' };
  const first = await load([candidate, other]);
  assert.equal(first.has(getVoteComparisonKey(candidate)), false);
  assert.equal(first.get(getVoteComparisonKey(other)), 1000);
  fail = false;
  assert.equal((await load([candidate])).get(getVoteComparisonKey(candidate)), 1000);
});

test('truncated responses are not used as a misleading benchmark; incomplete identities make no request', async (t) => {
  t.mock.method(console, 'error', () => {});
  let calls = 0;
  const load = createVoteComparisonLoader(async (query) => {
    calls++;
    return { total: 2, pageSize: 1, candidates: query.page === 1 ? [candidate] : [] };
  });
  assert.equal((await load([candidate])).size, 0);
  assert.equal((await load([{ votes: 100000 }])).size, 0);
  assert.equal(calls, 2);
});
