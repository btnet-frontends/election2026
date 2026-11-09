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
  assert.equal(result.cities['台北市'][0].percent, null);
  assert.throws(() => normalizeInvoicingResult({}), /格式/);
});

test('HTTP failures reject so the caller can retain its last successful result', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }));
  await assert.rejects(fetchInvoicingResult(), /503/);
});
