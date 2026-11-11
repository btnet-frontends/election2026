import test from 'node:test';
import assert from 'node:assert/strict';
import parties from '../src/json/parties.json' with { type: 'json' };
import { getMayorHistoryParty, normalizeMayorHistory } from '../src/utils/mayorHistoryApi.js';

test('every catalog party uses its own name and color instead of being classified as independent', () => {
  for (const party of parties) {
    const resolved = getMayorHistoryParty(party.name);
    assert.equal(resolved.key, party.name);
    assert.equal(resolved.label, party.name);
    assert.equal(resolved.color, party.color || '#888888');
  }
});

test('Hualien labor-party winner and a new party retain their identities', () => {
  const history = normalizeMayorHistory({ elections: [{ year: 2026, results: [
    { prvCityName: '花蓮縣', winner: { party: '台灣工黨' } },
    { prvCityName: '臺北市', winner: { party: '尚未收錄的政黨' } },
    { prvCityName: '新北市', winner: null }
  ] }] });
  assert.equal(history.results[2026].hualien_county, '台灣工黨');
  assert.equal(getMayorHistoryParty(history.results[2026].hualien_county).color, '#008001');
  assert.deepEqual(getMayorHistoryParty(history.results[2026].taipei_city), {
    key: '尚未收錄的政黨', label: '尚未收錄的政黨', color: '#888888'
  });
  assert.equal(history.results[2026].newtaipei_city, undefined);
});

test('legacy fallback years and Chinese spelling variants resolve to catalog colors', () => {
  for (const [legacy, id] of [['kmt', 1], ['dpp', 16], ['tpp', 350], ['independent', 0]]) {
    const party = parties.find((party) => party.id === id);
    assert.deepEqual(getMayorHistoryParty(legacy), getMayorHistoryParty(party.name));
  }
  assert.deepEqual(getMayorHistoryParty(' 臺灣工黨 '), getMayorHistoryParty('台灣工黨'));
});
