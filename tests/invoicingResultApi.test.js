import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeInvoicingResult, fetchInvoicingResult } from '../src/utils/invoicingResultApi.js';

const payload = (Candidate) => ({
  dDataTime: '2026/11/28 18:00',
  aInvoicingResult: [{ City: '臺北市', City_id: '63', Candidate }]
});

test('maps API names, trailing-space percentage and party IDs without inferring winners', () => {
  const result = normalizeInvoicingResult(payload([
    { Name: '測試甲', Number: 1, Political_party_id: '1', Votes: '1,234', 'Percentage ': 33, Elected: 'false' },
    { Name: '測試乙', Number: 2, Votes: 0, Percentage: 0, Elected: true }
  ]));
  const [first, second] = result.cities['台北市'];
  assert.equal(first.votes, 1234);
  assert.equal(first.number, 1);
  assert.equal(second.number, 2);
  assert.equal(first.percent, 33);
  assert.equal(first.party, '中國國民黨');
  assert.equal(first.partyImage, 'party1.png');
  assert.equal(first.elected, false);
  assert.equal(second.votes, 0);
  assert.equal(second.percent, 0);
  assert.equal(second.elected, true);
  assert.equal(result.updateTime, '2026/11/28 18:00');
});

test('party image filenames come from the catalog, not from the political party ID', () => {
  const result = normalizeInvoicingResult(payload([
    { Name: '民進黨', Political_party_id: '16' },
    { Name: '民眾黨', Political_party_id: 350 },
    { Name: '未知', Political_party_id: 'unknown' }
  ]));
  assert.deepEqual(result.cities['台北市'].map((candidate) => candidate.partyImage), [
    'party5.png', 'party51.png', null
  ]);
});

test('map colors use elected candidates and party IDs, including parties outside the major three', () => {
  for (const [partyId, color] of [[1, '#000099'], [16, '#1B9431'], [350, '#28C8C8'], [240, '#801f1f'], [382, '#549dbe'], [0, '#888888'], ['unknown', '#888888']]) {
    const result = normalizeInvoicingResult(payload([
      { Name: '票數較多但未當選', Political_party_id: 16, Votes: 9999, Elected: false },
      { Name: '當選人', Political_party_id: partyId, Votes: 100, Elected: 'true', Is_show_main_page: false }
    ]));
    assert.equal(result.winnerColors['台北市'], color);
    assert.equal(result.cities['台北市'].length, 1);
  }
});

test('map leaves cities without declared winners uncolored and clears previous winners on new data', () => {
  const first = normalizeInvoicingResult(payload([
    { Name: '當選人', Political_party_id: 1, Elected: 1 }
  ]));
  assert.equal(first.winnerColors['台北市'], '#000099');
  const next = normalizeInvoicingResult(payload([
    { Name: '開票中', Political_party_id: 1, Votes: 9999, Elected: 'false' }
  ]));
  assert.deepEqual(next.winnerColors, {});
  assert.deepEqual(normalizeInvoicingResult(payload(null)).winnerColors, {});
});

test('missing city/candidates stay empty; missing values are not fabricated as zero', () => {
  assert.deepEqual(normalizeInvoicingResult({ aInvoicingResult: [] }).cities, {});
  assert.deepEqual(normalizeInvoicingResult(payload(null)).cities['台北市'], []);
  const result = normalizeInvoicingResult(payload([
    { Name: '未提供票數', Votes: '', Percentage: null },
    { Name: '隱藏', Is_show_main_page: false },
    { Name: '隱藏字串', Is_show_main_page: 'false' }
  ]));
  assert.equal(result.cities['嘉義市'], undefined);
  assert.equal(result.cities['台北市'].length, 1);
  assert.equal(result.cities['台北市'][0].votes, null);
  assert.equal(result.cities['台北市'][0].number, null);
  assert.equal(result.cities['台北市'][0].percent, null);
  assert.throws(() => normalizeInvoicingResult({}), /格式/);
});

test('HTTP failures reject so the caller can retain its last successful result', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }));
  await assert.rejects(fetchInvoicingResult(), /503/);
});

test('progress is tracked independently by normalized city and refreshed without fabricating missing values', () => {
  const data = {
    aInvoicingResult: [
      { City: '臺北市', prgRate: 0 },
      { City: '新北市', prgRate: 42.75 },
      { City: '桃園市', prgRate: '100' },
      { City: '台南市' },
      { City: '高雄市', prgRate: -1 },
      { City: '基隆市', prgRate: 101 }
    ]
  };
  assert.deepEqual(normalizeInvoicingResult(data).progressByCity, {
    台北市: 0, 新北市: 42.75, 桃園市: 100, 台南市: null, 高雄市: null, 基隆市: 100
  });
  data.aInvoicingResult[0].prgRate = 68.5;
  assert.equal(normalizeInvoicingResult(data).progressByCity['台北市'], 68.5);
  assert.equal(normalizeInvoicingResult({ aInvoicingResult: [{ City: '臺北市' }] }).progressByCity['台北市'], null);
});

test('candidates reorder by updated votes while retaining their IDs and candidate numbers', () => {
  const candidates = [
    { Name: '甲', Number: 1, Votes: 100 },
    { Name: '乙', Number: 2, Votes: 80 },
    { Name: '丙', Number: 3, Votes: 90 }
  ];
  const first = normalizeInvoicingResult(payload(candidates)).cities['台北市'];
  const next = normalizeInvoicingResult(payload(candidates.map((candidate) => (
    candidate.Number === 2 ? { ...candidate, Votes: 110 } : candidate
  )))).cities['台北市'];
  assert.deepEqual(first.map((candidate) => candidate.number), [1, 3, 2]);
  assert.deepEqual(next.map((candidate) => candidate.number), [2, 1, 3]);
  for (const candidate of next) {
    assert.equal(candidate.id, first.find((previous) => previous.number === candidate.number).id);
  }
  assert.deepEqual(candidates.map((candidate) => candidate.Number), [1, 2, 3]);
});

test('ties use candidate number order; missing votes follow zero votes', () => {
  const result = normalizeInvoicingResult(payload([
    { Name: '缺資料', Number: 1, Votes: null },
    { Name: '零票', Number: 2, Votes: 0 },
    { Name: '同票乙', Number: 4, Votes: 100 },
    { Name: '同票甲', Number: 3, Votes: 100 }
  ]));
  assert.deepEqual(result.cities['台北市'].map((candidate) => candidate.number), [3, 4, 2, 1]);
});

test('counting map uses highest votes including hidden candidates without changing elected flags', () => {
  const result = normalizeInvoicingResult(payload([
    { Name: '已標記當選', Political_party_id: 1, Votes: 100, Elected: true },
    { Name: '目前領先', Political_party_id: 16, Votes: '1,234', Elected: false, Is_show_main_page: false }
  ]));
  assert.equal(result.leadingColors['台北市'], '#1B9431');
  assert.equal(result.winnerColors['台北市'], '#000099');
  assert.equal(result.cities['台北市'].length, 1);
});

test('zero votes stay uncolored before counting, including a single candidate', () => {
  for (const candidates of [
    [{ Name: '甲', Political_party_id: 1, Votes: 0 }],
    [
      { Name: '甲', Political_party_id: 1, Votes: 0 },
      { Name: '乙', Political_party_id: 16, Votes: '0' },
      { Name: '丙', Political_party_id: 350, Votes: null }
    ]
  ]) {
    assert.deepEqual(normalizeInvoicingResult(payload(candidates)).leadingColors, {});
  }
});

test('positive ties retain all leading party colors, including same-party ties', () => {
  for (const votes of [1, 100]) {
    const result = normalizeInvoicingResult(payload([
      { Name: '甲', Political_party_id: 1, Votes: votes },
      { Name: '乙', Political_party_id: 16, Votes: votes },
      { Name: '丙', Political_party_id: 350, Votes: null }
    ]));
    assert.deepEqual(result.leadingColors['台北市'], ['#000099', '#1B9431']);
    assert.deepEqual(result.winnerColors, {});
  }
  const sameParty = normalizeInvoicingResult(payload([
    { Name: '甲', Political_party_id: 1, Votes: 100 },
    { Name: '乙', Political_party_id: 1, Votes: 100 }
  ]));
  assert.deepEqual(sameParty.leadingColors['台北市'], ['#000099', '#000099']);
});

test('missing votes remain uncolored and a resolved tie becomes a solid leader color', () => {
  assert.deepEqual(normalizeInvoicingResult(payload([{ Name: '甲', Votes: '' }])).leadingColors, {});
  assert.deepEqual(normalizeInvoicingResult(payload(null)).leadingColors, {});
  const result = normalizeInvoicingResult(payload([
    { Name: '甲', Political_party_id: 1, Votes: 101 },
    { Name: '乙', Political_party_id: 16, Votes: 100 }
  ]));
  assert.equal(result.leadingColors['台北市'], '#000099');
});

test('requests fresh results after build and receives changed votes and elected flags', async (t) => {
  const calls = [];
  let votes = 100;
  let elected = false;
  t.mock.method(Date, 'now', () => 1234567890 + calls.length);
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    return Response.json(payload([{ Name: '候選人', Votes: votes, Elected: elected }]));
  });
  const first = await fetchInvoicingResult();
  votes = 1234;
  elected = true;
  const latest = await fetchInvoicingResult();
  assert.equal(first.cities['台北市'][0].votes, 100);
  assert.equal(first.cities['台北市'][0].elected, false);
  assert.equal(latest.cities['台北市'][0].votes, 1234);
  assert.equal(latest.cities['台北市'][0].elected, true);
  assert.notEqual(calls[0].url, calls[1].url);
  for (const { url, options } of calls) {
    assert.match(url, /getInvoicingResult\?v=\d+$/);
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal instanceof AbortSignal);
  }
  await fetchInvoicingResult('/api/invoicing-result?source=test');
  assert.match(calls[2].url, /^\/api\/invoicing-result\?source=test&v=\d+$/);
});
