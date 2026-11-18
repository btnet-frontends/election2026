import test from 'node:test';
import assert from 'node:assert/strict';
import { createRenderer } from 'vue';
import { getPhase, getActiveNavNo, getPhaseComponentFlags, SCHEDULE_START } from '../src/utils/schedule.js';
import { usePhase } from '../src/composables/usePhase.js';
import { useLiveVoteResult } from '../src/composables/useLiveVoteResult.js';

const start = new Date(SCHEDULE_START).getTime();
const flush = () => new Promise((resolve) => setImmediate(resolve));
const renderer = createRenderer({
  createComment: () => ({}), insert() {}, remove() {}, parentNode() {}, nextSibling() {}
});

test('only the API ends counting; pre-election remains governed by the start time', () => {
  assert.equal(getPhase(start - 1, true), 'default');
  assert.equal(getPhase(start, false), 'start');
  assert.equal(getPhase(start, true), 'end');
  assert.equal(getPhase(start + 365 * 86400000, false), 'start');
  for (const unknown of [undefined, null, 'true', 1]) {
    assert.equal(getPhase(start, unknown), 'start');
  }
  assert.equal(getActiveNavNo(start, false), 2);
  assert.equal(getActiveNavNo(start, true), 3);
});

test('API polling switches all phase consumers together and retains state on failures or missing flag', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  t.mock.method(Date, 'now', () => start + 1000);
  globalThis.window = {};
  globalThis.document = new EventTarget();
  globalThis.document.hidden = false;
  let flag = false;
  let failed = false;
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return failed ? new Response('', { status: 503 }) : Response.json({
      ...(flag === undefined ? {} : { bIsShowSearchBar: flag }), aInvoicingResult: []
    });
  });
  const phases = [];
  let vote;
  const apps = Array.from({ length: 3 }, () => {
    const app = renderer.createApp({ setup() {
      phases.push(usePhase());
      vote = useLiveVoteResult();
      return () => null;
    } });
    app.mount({});
    return app;
  });
  t.after(() => {
    apps.forEach((app) => app.unmount());
    delete globalThis.window;
    delete globalThis.document;
  });
  const assertPhase = (expected) => {
    for (const state of phases) {
      assert.equal(state.phase.value, expected);
      assert.equal(state.navNo.value, expected === 'end' ? 3 : 2);
      for (const [name, visible] of Object.entries(getPhaseComponentFlags(expected))) {
        assert.equal(state.isComponentVisible(name), visible);
      }
    }
  };
  await flush();
  assert.equal(calls, 1);
  assertPhase('start');
  flag = true;
  t.mock.timers.tick(30000);
  await flush();
  assert.equal(calls, 2);
  assertPhase('end');
  failed = true;
  t.mock.timers.tick(30000);
  await flush();
  assert.equal(vote.refreshFailed.value, true);
  assertPhase('end');
  failed = false;
  flag = undefined;
  t.mock.timers.tick(30000);
  await flush();
  assertPhase('end');
  flag = false;
  t.mock.timers.tick(30000);
  await flush();
  assertPhase('start');
});
