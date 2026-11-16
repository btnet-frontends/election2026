import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchElectionStat } from '../src/utils/electionStatApi.js';

test('municipality charts preserve independent and other party rates in every API year', async (t) => {
  const rates = { 2018: 41.9, 2022: 25.77, 2026: 63.95 };
  t.mock.method(globalThis, 'fetch', async () => Response.json(Object.fromEntries(
    Object.entries(rates).map(([year, rate]) => [
      `${year}年直轄市長選舉各政黨候選人得票率`,
      { unit: '%', cities: {
        台北市: { 國民黨: 20, 民進黨: 16, 無黨籍及其他政黨: rate },
        新北市: { 國民黨: 60, 民進黨: 40, 無黨籍及其他政黨: 0 }
      } }
    ])
  )));
  const result = await fetchElectionStat();
  for (const [year, rate] of Object.entries(rates)) {
    assert.equal(result.municipalityYears[year][0].other, rate);
    assert.equal(result.municipalityYears[year][1].other, 0);
  }
});

test('legacy rates remain supported while the current field takes precedence, including zero', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({
    '2022年直轄市長選舉各政黨候選人得票率': { cities: {
      台北市: { 無黨籍及未經政黨推薦: 25.774 },
      新北市: { 無黨籍及其他政黨: 0, 無黨籍及未經政黨推薦: 12 },
      桃園市: { 無黨籍及其他政黨: 7.95, 無黨籍及未經政黨推薦: 1 },
      台中市: { 國民黨: 60, 民進黨: 40 }
    } }
  }));
  const result = await fetchElectionStat();
  assert.deepEqual(result.municipalityYears[2022].map((city) => city.other), [25.77, 0, 7.95, 0]);
});
