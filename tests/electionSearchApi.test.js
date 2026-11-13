import test from 'node:test';
import assert from 'node:assert/strict';
import { buildElectionSearchPayload, fetchElectionSearch, normalizeElectionSearch, SEARCH_MODE } from '../src/utils/electionSearchApi.js';

test('party search sends office type, city, district, elected filter and ten-row pagination together', () => {
  assert.deepEqual(buildElectionSearchPayload({
    searchMode: SEARCH_MODE.party, candidateType: 4, party: '中國國民黨', prvCityCode: '63-000',
    deptCode: '010', onlyElected: true, page: 2, pageSize: 10
  }), {
    searchMode: 3, candidateType: 4, party: '中國國民黨', prvCityCode: '63-000',
    deptCode: '010', onlyElected: 1, page: 2, pageSize: 10
  });
});

test('all districts omits the optional district while preserving the city', () => {
  assert.deepEqual(buildElectionSearchPayload({
    searchMode: SEARCH_MODE.party, party: '民主進步黨', prvCityCode: '65-000',
    deptCode: undefined, onlyElected: false, page: 1, pageSize: 10
  }), { searchMode: 3, party: '民主進步黨', prvCityCode: '65-000', page: 1, pageSize: 10 });
});

test('office and name search retain their existing payloads', () => {
  assert.deepEqual(buildElectionSearchPayload({
    searchMode: SEARCH_MODE.office, candidateType: 4, prvCityCode: '63-000', deptCode: '010'
  }), { searchMode: 1, candidateType: 4, prvCityCode: '63-000', deptCode: '010' });
  assert.deepEqual(buildElectionSearchPayload({ searchMode: SEARCH_MODE.name, name: ' 王小明 ' }),
    { searchMode: 2, name: '王小明' });
});

test('candidate list preserves zero votes, percentages, numbers, elected state and pagination totals', () => {
  const result = normalizeElectionSearch({
    bIsSuccess: true, iTotal: 23, iPage: 3, iPageSize: 10,
    searchResult: [
      { Name: '王小明', Number: 8, Votes: 0, Percentage: 0, Elected: false },
      { Name: '陳小華', Number: 2, Votes: 23403, Percentage: 9.63, Elected: true },
      { Name: '李小文', Number: null, Votes: null, Percentage: null }
    ]
  });
  assert.equal(result.total, 23);
  assert.equal(result.page, 3);
  assert.equal(result.pageSize, 10);
  assert.deepEqual(result.candidates.map(({ number, votes, percent, elected }) => ({ number, votes, percent, elected })), [
    { number: 8, votes: 0, percent: 0, elected: false },
    { number: 2, votes: 23403, percent: 9.63, elected: true },
    { number: null, votes: null, percent: null, elected: false }
  ]);
});

test('fetch posts the combined party filters without losing them on later pages', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://example.test/search');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), {
      searchMode: 3, candidateType: 4, party: '中國國民黨', prvCityCode: '63-000', deptCode: '010', page: 4, pageSize: 10
    });
    return new Response(JSON.stringify({ bIsSuccess: true, searchResult: [], iTotal: 32, iPage: 4, iPageSize: 10 }));
  });
  const result = await fetchElectionSearch({
    searchMode: 3, candidateType: 4, party: '中國國民黨', prvCityCode: '63-000', deptCode: '010', page: 4, pageSize: 10
  }, { url: 'https://example.test/search' });
  assert.equal(result.total, 32);
  assert.equal(result.page, 4);
});

test('party search with all office types omits candidateType', () => {
  const payload = buildElectionSearchPayload({
    searchMode: SEARCH_MODE.party, party: '中國國民黨', candidateType: undefined,
    prvCityCode: '63-000', page: 1, pageSize: 10
  });
  assert.equal(Object.hasOwn(payload, 'candidateType'), false);
  assert.equal(payload.party, '中國國民黨');
});

test('office and party searches send constituency and village filters through pagination', () => {
  for (const searchMode of [SEARCH_MODE.office, SEARCH_MODE.party]) {
    const payload = buildElectionSearchPayload({
      searchMode, candidateType: 4, party: '中國國民黨', prvCityCode: '63-000',
      areaCode: '01', deptCode: '010', liCode: '002', page: 2, pageSize: 10
    });
    assert.equal(payload.areaCode, '01');
    assert.equal(payload.deptCode, '010');
    assert.equal(payload.liCode, '002');
    assert.equal(payload.page, 2);
  }
});

test('village filters require a district and name searches omit geographic filters', () => {
  assert.equal(Object.hasOwn(buildElectionSearchPayload({
    searchMode: 1, candidateType: 4, prvCityCode: '63-000', liCode: '002'
  }), 'liCode'), false);
  assert.deepEqual(buildElectionSearchPayload({
    searchMode: 2, name: ' 王小明 ', areaCode: '01', deptCode: '010', liCode: '002'
  }), { searchMode: 2, name: '王小明' });
});

test('village selection is included in the actual POST body on later pages', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), {
      searchMode: 1, candidateType: 4, prvCityCode: '63-000',
      deptCode: '010', liCode: '003', page: 2, pageSize: 1
    });
    return new Response(JSON.stringify({
      bIsSuccess: true, searchResult: [], iTotal: 1, iPage: 2, iPageSize: 1
    }));
  });
  await fetchElectionSearch({
    searchMode: 1, candidateType: 4, prvCityCode: '63-000',
    deptCode: '010', liCode: '003', page: 2, pageSize: 1
  });
});
