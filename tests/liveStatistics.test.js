import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer } from 'vue';
import { useLiveStatistics } from '../src/composables/useLiveStatistics.js';
import { fetchStatisticsJson } from '../src/utils/statisticsApi.js';
import { fetchSeatHistory } from '../src/utils/seatHistoryApi.js';
import { fetchElectionStat } from '../src/utils/electionStatApi.js';
import { fetchMayorHistory } from '../src/utils/mayorHistoryApi.js';

const flush = () => new Promise((resolve) => setImmediate(resolve));
const renderer = createRenderer({
  createComment: () => ({}), insert() {}, remove() {}, parentNode() {}, nextSibling() {}
});

function mount(t, fetchData, initial = { seats: 21 }) {
  const document = new EventTarget();
  document.hidden = false;
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  globalThis.document = document;
  t.mock.timers.enable({ apis: ['setInterval', 'setTimeout'] });
  let data;
  const app = renderer.createApp({
    setup() {
      data = useLiveStatistics(initial, fetchData);
      return () => null;
    }
  });
  app.mount({});
  t.after(() => {
    if (app._instance) app.unmount();
    if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
    else delete globalThis.document;
  });
  return { app, data, document };
}

test('refreshes on mount and each 30 seconds; retains last success when API fails', async (t) => {
  let calls = 0;
  const { data } = mount(t, async () => ++calls === 2 ? null : { seats: calls + 21 });
  await flush();
  assert.equal(data.value.seats, 22);
  t.mock.timers.tick(30000);
  await flush();
  assert.equal(calls, 2);
  assert.equal(data.value.seats, 22);
  t.mock.timers.tick(30000);
  await flush();
  assert.equal(data.value.seats, 24);
});

test('pauses in hidden tabs, refreshes on return, and stops after unmount', async (t) => {
  let calls = 0;
  const { app, document } = mount(t, async () => ({ seats: ++calls }));
  await flush();
  document.hidden = true;
  t.mock.timers.tick(30000);
  await flush();
  assert.equal(calls, 1);
  document.hidden = false;
  document.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(calls, 2);
  app.unmount();
  t.mock.timers.tick(30000);
  document.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(calls, 2);
});

test('avoids overlapping requests and discards a timed-out response', async (t) => {
  let resolve;
  let signal;
  let calls = 0;
  const { data, document } = mount(t, (requestSignal) => {
    signal = requestSignal;
    calls++;
    return new Promise((done) => { resolve = done; });
  });
  document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(calls, 1);
  t.mock.timers.tick(10000);
  assert.equal(signal.aborted, true);
  resolve({ seats: 99 });
  await flush();
  assert.equal(data.value.seats, 21);
  document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(calls, 2);
  resolve({ seats: 23 });
  await flush();
  assert.equal(data.value.seats, 23);
});

test('build and production browser use UAT CDN with cache disabled', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    return Response.json({ ok: true });
  });
  await fetchStatisticsJson('getParliamentaryHistory');
  assert.match(calls[0].url, /^https:\/\/doqvf81n9htmm\.cloudfront\.net\/files\/2026election\/uat\/getParliamentaryHistory\?v=\d+$/);
  globalThis.window = {};
  t.after(() => { delete globalThis.window; });
  await fetchStatisticsJson('getParliamentaryHistory');
  assert.match(calls[1].url, /^https:\/\/doqvf81n9htmm\.cloudfront\.net\/files\/2026election\/uat\/getParliamentaryHistory\?v=\d+$/);
  assert.equal(calls[1].options.cache, 'no-store');
  assert.ok(calls[1].options.signal instanceof AbortSignal);
});

test('updated 2022 Taipei DPP seats and vote rate reach the normalized data', async (t) => {
  let seats = 21;
  t.mock.method(globalThis, 'fetch', async () => Response.json({
    2022: { 臺北市: { total_seats: 61, parties: {
      民主進步黨: { seats, vote_rate: 38.5 }
    } } }
  }));
  const first = await fetchSeatHistory();
  seats = 22;
  const latest = await fetchSeatHistory();
  assert.equal(first.data[2022]['臺北市'].parties[0].seats, 21);
  assert.equal(latest.data[2022]['臺北市'].parties[0].seats, 22);
  assert.equal(latest.data[2022]['臺北市'].parties[0].voteRate, 38.5);
});

for (const scenario of [
  {
    endpoint: 'getParliamentaryHistory',
    fetchData: fetchSeatHistory,
    json: (value) => ({ 2026: { 臺北市: { total_seats: 61, parties: {
      中國國民黨: { seats: value, vote_rate: 32.64 }
    } } } }),
    read: (data) => data.data[2026]['臺北市'].parties[0].seats,
    values: [22, 19]
  },
  {
    endpoint: 'getElectionStat',
    fetchData: fetchElectionStat,
    json: (value) => ({ '2008年以來台灣重要選舉投票率': {
      data: [{ election: '2026年直轄市長', turnout: value }]
    } }),
    read: (data) => data.turnout.items[0].value,
    values: [60, 65]
  },
  {
    endpoint: 'getMayorHistory',
    fetchData: fetchMayorHistory,
    json: (value) => ({ elections: [{ year: 2026, results: [
      { prvCityName: '臺北市', winner: { party: value } }
    ] }] }),
    read: (data) => data.results[2026].taipei_city,
    values: ['中國國民黨', '民主進步黨'],
    expected: ['kmt', 'dpp']
  }
]) {
  test(`${scenario.endpoint} replaces build data on load and polls new data after build`, async (t) => {
    let value = scenario.values[0];
    const urls = [];
    t.mock.method(globalThis, 'fetch', async (url) => {
      urls.push(url);
      return Response.json(scenario.json(value));
    });
    const buildData = await scenario.fetchData();
    globalThis.window = {};
    t.after(() => { delete globalThis.window; });
    value = scenario.values[1];
    const { data } = mount(t, scenario.fetchData, buildData);
    await flush();
    assert.equal(scenario.read(buildData), (scenario.expected ?? scenario.values)[0]);
    assert.equal(scenario.read(data.value), (scenario.expected ?? scenario.values)[1]);
    value = scenario.values[0];
    t.mock.timers.tick(30000);
    await flush();
    assert.equal(scenario.read(data.value), (scenario.expected ?? scenario.values)[0]);
    assert.equal(urls.length, 3);
    for (const url of urls) {
      assert.ok(url.startsWith(`https://doqvf81n9htmm.cloudfront.net/files/2026election/uat/${scenario.endpoint}?v=`));
    }
  });
}
