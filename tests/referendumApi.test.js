import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReferendum, fetchReferendum, REFERENDUM_URL } from '../src/utils/referendumApi.js';

const payload = {
  dDataTime: '2026/09/23 12:00',
  dBTUpdateDataTime: '2026-09-23 12:00:00',
  fAgreeRate: 50,
  fDisagreeRate: 50,
  iAgreeTks: 5000000,
  iDisagreeTks: 5000000,
  iGmeb: 19615014,
  bIsPass: false,
  sError: ''
};

test('maps documented response and uses API pass flag independently of vote rates', () => {
  assert.deepEqual(normalizeReferendum(payload), {
    status: 'failed',
    totalElectors: 19615014,
    thresholdVotes: 4903754,
    results: {
      agree: { percentage: 5000000 / 19615014 * 100, votes: 5000000 },
      disagree: { percentage: 5000000 / 19615014 * 100, votes: 5000000 }
    },
    updateTime: '2026/09/23 12:00'
  });
  assert.equal(normalizeReferendum({ ...payload, bIsPass: true }).status, 'passed');
  assert.equal(normalizeReferendum({ ...payload, fAgreeRate: 90 }).status, 'failed');
});

test('preserves zero votes and falls back to backend timestamp', () => {
  const result = normalizeReferendum({ ...payload, dDataTime: '', iAgreeTks: 0, fAgreeRate: 0 });
  assert.deepEqual(result.results.agree, { votes: 0, percentage: 0 });
  assert.equal(result.updateTime, payload.dBTUpdateDataTime);
});

test('iGmeb updates electorate and rounded-up quarter threshold together', () => {
  const result = normalizeReferendum({ ...payload, iGmeb: 20000001 });
  assert.equal(result.totalElectors, 20000001);
  assert.equal(result.thresholdVotes, 5000001);
  for (const iGmeb of [undefined, null, '', '19615014', 0, -1, 1.5, Infinity]) {
    const missing = normalizeReferendum({ ...payload, iGmeb });
    assert.equal(missing.totalElectors, null);
    assert.equal(missing.thresholdVotes, null);
    assert.equal(missing.results.agree.votes, 5000000);
    assert.equal(missing.results.agree.percentage, null);
    assert.equal(missing.results.disagree.percentage, null);
  }
});

test('rejects service errors and incomplete or invalid results instead of fabricating counts', () => {
  assert.throws(() => normalizeReferendum({ ...payload, sError: '暫無資料' }), /暫無資料/);
  for (const patch of [{ iAgreeTks: null }, { iDisagreeTks: -1 },
    { bIsPass: 'false' }, { iAgreeTks: 1.5 }]) {
    assert.throws(() => normalizeReferendum({ ...payload, ...patch }), /格式/);
  }
  assert.throws(() => normalizeReferendum({}), /格式/);
});

test('bar percentages use vote counts divided by iGmeb and ignore API vote-share rates', () => {
  const data = { ...payload, iAgreeTks: 5419403, iDisagreeTks: 5363810, fAgreeRate: 99, fDisagreeRate: 1 };
  const result = normalizeReferendum(data);
  assert.equal(result.results.agree.percentage, 5419403 / 19615014 * 100);
  assert.equal(result.results.disagree.percentage, 5363810 / 19615014 * 100);
  assert.equal(result.results.agree.votes, 5419403);
  assert.equal(result.results.disagree.votes, 5363810);
  assert.equal(result.status, 'failed');
  const newTotal = normalizeReferendum({ ...data, iGmeb: 20000000, fAgreeRate: undefined, fDisagreeRate: NaN });
  assert.equal(newTotal.results.agree.percentage, 5419403 / 20000000 * 100);
  assert.equal(newTotal.results.disagree.percentage, 5363810 / 20000000 * 100);
});

test('fetch uses endpoint, cache revalidation and cancellation signal', async (t) => {
  const controller = new AbortController();
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, REFERENDUM_URL);
    assert.equal(options.signal, controller.signal);
    assert.equal(options.cache, 'no-cache');
    return Response.json(payload);
  });
  assert.equal((await fetchReferendum(undefined, controller.signal)).results.agree.votes, 5000000);
});

test('HTTP and JSON failures reject so the UI can retain the last successful result', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }));
  await assert.rejects(fetchReferendum(), /503/);
  mock.mock.mockImplementation(async () => new Response('invalid json'));
  await assert.rejects(fetchReferendum(), SyntaxError);
});
