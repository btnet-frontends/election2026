import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer } from 'vue';
import { useLiveVoteResult } from '../src/composables/useLiveVoteResult.js';

const flush = () => new Promise((resolve) => setImmediate(resolve));
const renderer = createRenderer({
  createComment: () => ({}), insert() {}, remove() {}, parentNode() {}, nextSibling() {}
});

test('ticker and vote islands share requests, polling, failure fallback and lifecycle', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const document = new EventTarget();
  document.hidden = false;
  globalThis.window = {};
  globalThis.document = document;
  t.after(() => {
    delete globalThis.window;
    delete globalThis.document;
  });
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    if (calls === 3) return new Response('', { status: 503 });
    return Response.json({ aInvoicingResult: [{ City: '台北市', Candidate: [
      { Name: '測試候選人', Votes: calls * 100, Elected: calls > 1 }
    ] }] });
  });
  const states = [];
  const apps = Array.from({ length: 2 }, () => {
    const app = renderer.createApp({ setup() {
      states.push(useLiveVoteResult());
      return () => null;
    } });
    app.mount({});
    return app;
  });
  t.after(() => apps.forEach((app) => { if (app._instance) app.unmount(); }));
  await flush();
  assert.equal(calls, 1);
  assert.equal(states[0].result, states[1].result);
  t.mock.timers.tick(30000);
  await flush();
  assert.equal(calls, 2);
  assert.equal(states[1].result.value.cities['台北市'][0].votes, 200);
  assert.equal(states[1].result.value.cities['台北市'][0].elected, true);
  apps[0].unmount();
  t.mock.timers.tick(30000);
  await flush();
  assert.equal(calls, 3);
  assert.equal(states[1].refreshFailed.value, true);
  assert.equal(states[1].result.value.cities['台北市'][0].votes, 200);
  document.hidden = true;
  t.mock.timers.tick(30000);
  await flush();
  assert.equal(calls, 3);
  document.hidden = false;
  document.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(calls, 4);
  assert.equal(states[1].refreshFailed.value, false);
  apps[1].unmount();
  t.mock.timers.tick(30000);
  document.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(calls, 4);
});
