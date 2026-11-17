import test from 'node:test';
import assert from 'node:assert/strict';
import { getVoteMaximum, getVoteBarWidth, getVoteComparisonKey, getConstituencyVoteMaxima, groupCandidatesByConstituency } from '../src/utils/voteComparison.js';

const council = (votes, extra = {}) => ({ candidateType: 1, prvCityCode: '63-000', areaCode: '01', votes, ...extra });

test('one shared region header groups all candidates in a constituency even when results are interleaved', () => {
  const first = council(1000, { name: '甲', locationText: '臺北市・第1選舉區', areaDeptsText: '士林區、北投區' });
  const other = council(2000, { name: '乙', areaCode: '02', locationText: '臺北市・第2選舉區' });
  const last = { ...first, name: '丙' };
  const groups = groupCandidatesByConstituency([first, other, last]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].locationText, first.locationText);
  assert.equal(groups[0].areaDeptsText, first.areaDeptsText);
  assert.deepEqual(groups.map((group) => group.candidates.map((candidate) => candidate.name)), [['甲', '丙'], ['乙']]);
});

test('shared region groups keep different villages and public offices separate', () => {
  const village = { candidateType: 4, prvCityCode: '63-000', deptCode: '010', liCode: '002', locationText: '臺北市・松山區・莊敬里' };
  const groups = groupCandidatesByConstituency([village, { ...village }, { ...village, liCode: '003' }, { ...village, candidateType: 5 }]);
  assert.deepEqual(groups.map((group) => group.candidates.length), [2, 1, 1]);
  assert.deepEqual(groupCandidatesByConstituency([]), []);
});

test('candidates on different pages use the same complete constituency maximum', () => {
  const pages = [[council(10000), council(5000)], [council(20000)]];
  const maxima = getConstituencyVoteMaxima(pages.flat());
  assert.deepEqual(pages.map((page) => page.map((candidate) =>
    getVoteBarWidth(candidate.votes, maxima.get(getVoteComparisonKey(candidate)))
  )), [[50, 25], [100]]);
});

test('city, office type and constituency separate comparisons while council administrative districts do not', () => {
  const candidates = [
    council(20000, { deptCode: '110' }), council(10000, { deptCode: '120' }),
    council(5000, { areaCode: '02' }), council(30000, { prvCityCode: '65-000' }),
    council(2500, { candidateType: 2 })
  ];
  const maxima = getConstituencyVoteMaxima(candidates);
  assert.equal(maxima.size, 4);
  assert.deepEqual(candidates.map((candidate) => getVoteBarWidth(candidate.votes, maxima.get(getVoteComparisonKey(candidate)))), [100, 50, 100, 100, 100]);
});

test('village chiefs compare only within the same village and township', () => {
  const candidate = { candidateType: 4, prvCityCode: '63-000', deptCode: '010', liCode: '002' };
  const candidates = [
    { ...candidate, votes: 3000 }, { ...candidate, votes: 1500 },
    { ...candidate, votes: 100, liCode: '003' }, { ...candidate, votes: 4000, deptCode: '020' }
  ];
  const maxima = getConstituencyVoteMaxima(candidates);
  assert.equal(maxima.size, 3);
  assert.deepEqual(candidates.map((candidate) => getVoteBarWidth(candidate.votes, maxima.get(getVoteComparisonKey(candidate)))), [100, 50, 100, 100]);
});

test('representatives in different townships do not share constituency 01', () => {
  for (const candidateType of [6, 7, 8]) {
    const candidate = { candidateType, prvCityCode: '10-002', deptCode: '010', areaCode: '01', votes: 2000 };
    assert.notEqual(getVoteComparisonKey(candidate), getVoteComparisonKey({ ...candidate, deptCode: '020' }));
    assert.notEqual(getVoteComparisonKey(candidate), getVoteComparisonKey({ ...candidate, areaCode: '02' }));
  }
});

test('township chiefs compare within a township and incomplete geography is excluded', () => {
  const candidate = { candidateType: 5, prvCityCode: '10-002', deptCode: '010' };
  assert.notEqual(getVoteComparisonKey(candidate), getVoteComparisonKey({ ...candidate, deptCode: '020' }));
  for (const candidate of [council(100, { areaCode: '' }), { votes: 100 }, { candidateType: 4, prvCityCode: '63-000', deptCode: '010' }]) {
    assert.equal(getVoteComparisonKey(candidate), null);
    assert.equal(getConstituencyVoteMaxima([candidate]).size, 0);
  }
});

test('empty, pending, invalid and zero votes have finite empty bars; ties share full length', () => {
  for (const votes of [[], [0], [null, undefined, NaN, -1, Infinity]]) {
    const maximum = getVoteMaximum(votes.map((votes) => ({ votes })));
    assert.equal(maximum, 0);
    for (const value of votes) assert.equal(getVoteBarWidth(value, maximum), 0);
  }
  const candidates = [council(2500), council(2500), council(0), council(null)];
  const maximum = getConstituencyVoteMaxima(candidates).get(getVoteComparisonKey(candidates[0]));
  assert.deepEqual(candidates.map(({ votes }) => getVoteBarWidth(votes, maximum)), [100, 100, 0, 0]);
});
