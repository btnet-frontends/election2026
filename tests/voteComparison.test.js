import test from 'node:test';
import assert from 'node:assert/strict';
import { getPageVoteMaximum, getVoteBarWidth } from '../src/utils/voteComparison.js';

test('each page compares vote counts against its own highest vote count', () => {
  const firstPage = [{ votes: 20000 }, { votes: 10000 }, { votes: 5000 }];
  const nextPage = [{ votes: 10000 }, { votes: 5000 }];
  const firstMax = getPageVoteMaximum(firstPage);
  const nextMax = getPageVoteMaximum(nextPage);
  assert.deepEqual(firstPage.map(({ votes }) => getVoteBarWidth(votes, firstMax)), [100, 50, 25]);
  assert.deepEqual(nextPage.map(({ votes }) => getVoteBarWidth(votes, nextMax)), [100, 50]);
});

test('empty, pending and zero-vote pages have empty bars without invalid widths', () => {
  for (const candidates of [[], [{ votes: 0 }], [{ votes: null }, { votes: undefined }]]) {
    const maximum = getPageVoteMaximum(candidates);
    assert.equal(maximum, 0);
    for (const { votes } of candidates) assert.equal(getVoteBarWidth(votes, maximum), 0);
  }
});

test('ties share full length and zero votes stay empty beside positive results', () => {
  const candidates = [{ votes: 2500 }, { votes: 2500 }, { votes: 0 }, { votes: null }];
  const maximum = getPageVoteMaximum(candidates);
  assert.deepEqual(candidates.map(({ votes }) => getVoteBarWidth(votes, maximum)), [100, 100, 0, 0]);
});
