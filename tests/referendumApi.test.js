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
  bIsPass: false,
  sError: ''
};

test('maps documented response and uses API pass flag independently of vote rates', () => {
  assert.deepEqual(normalizeReferendum(payload), {
    status: 'failed',
    results: {
      agree: { percentage: 50, votes: 5000000 },
      disagree: { percentage: 50, votes: 5000000 }
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

test('rejects service errors and incomplete or invalid results instead of fabricating counts', () => {
  assert.throws(() => normalizeReferendum({ ...payload, sError: '暫無資料' }), /暫無資料/);
  for (const patch of [{ iAgreeTks: null }, { iDisagreeTks: -1 }, { fAgreeRate: 101 },
    { fDisagreeRate: NaN }, { bIsPass: 'false' }, { iAgreeTks: 1.5 }]) {
    assert.throws(() => normalizeReferendum({ ...payload, ...patch }), /格式/);
  }
  assert.throws(() => normalizeReferendum({}), /格式/);
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
