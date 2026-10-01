// backend/tests/standingsRanking.test.js
// Pure unit tests for the CANONICAL ranking utility (JUNDA-STANDINGS-RANK-001).
// Run: node --test backend/tests/standingsRanking.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rankTable, buildWarnings, goalDifferenceOf } from '../utils/standingsRanking.js';

const names = (rows) => rows.map((t) => t.name);
const positions = (rows) => rows.map((t) => t.position);

describe('standingsRanking (backend canonical)', () => {
  it('orders by points descending regardless of stored rank or input order', () => {
    const out = rankTable([
      { _id: 'c', name: 'C', rank: 1, pts: 18, gf: 10, ga: 10 },
      { _id: 'a', name: 'A', rank: 7, pts: 25, gf: 10, ga: 10 },
      { _id: 'b', name: 'B', rank: 2, pts: 20, gf: 10, ga: 10 },
    ]);
    assert.deepEqual(names(out), ['A', 'B', 'C']);
    assert.deepEqual(positions(out), [1, 2, 3]);
  });

  it('breaks equal-points ties by goal difference', () => {
    const out = rankTable([
      { _id: 'b', name: 'B', pts: 20, gf: 13, ga: 10 },
      { _id: 'a', name: 'A', pts: 20, gf: 18, ga: 10 },
    ]);
    assert.deepEqual(names(out), ['A', 'B']);
  });

  it('breaks equal PTS+GD ties by goals scored', () => {
    const out = rankTable([
      { _id: 'b', name: 'B', pts: 20, gf: 14, ga: 9 },
      { _id: 'a', name: 'A', pts: 20, gf: 18, ga: 13 },
    ]);
    assert.deepEqual(names(out), ['A', 'B']);
  });

  it('shares position on complete sporting ties with stable deterministic order', () => {
    const input = [
      { _id: 'b', name: 'B', pts: 20, gf: 18, ga: 13 },
      { _id: 'a', name: 'A', pts: 20, gf: 18, ga: 13 },
    ];
    const first = rankTable(input);
    const second = rankTable([...input].reverse());
    assert.deepEqual(positions(first), [1, 1]);
    assert.deepEqual(names(first), names(second));
  });

  it('uses standard competition numbering 1,2,2,4', () => {
    const out = rankTable([
      { _id: 'd', name: 'D', pts: 18, gf: 5, ga: 5 },
      { _id: 'c', name: 'C', pts: 20, gf: 10, ga: 5 },
      { _id: 'b', name: 'B', pts: 20, gf: 10, ga: 5 },
      { _id: 'a', name: 'A', pts: 25, gf: 5, ga: 5 },
    ]);
    assert.deepEqual(names(out), ['A', 'B', 'C', 'D']);
    assert.deepEqual(positions(out), [1, 2, 2, 4]);
  });

  it('handles negative goal difference', () => {
    const out = rankTable([
      { _id: 'a', name: 'A', pts: 10, gf: 2, ga: 20 },
      { _id: 'b', name: 'B', pts: 10, gf: 5, ga: 10 },
    ]);
    assert.equal(out[0].name, 'B');
    assert.equal(out[0].gd, -5);
    assert.equal(out[1].gd, -18);
  });

  it('resolves the live PNI/Babito and Valley/FC-Junda style ties', () => {
    const out = rankTable([
      { _id: '1', name: 'Babito Warriors', rank: 2, pts: 19, gf: 18, ga: 18 },
      { _id: '2', name: 'PNI', rank: 3, pts: 19, gf: 16, ga: 11 },
      { _id: '3', name: 'FC Junda', rank: 7, pts: 16, gf: 16, ga: 15 },
      { _id: '4', name: 'Valley Talent', rank: 6, pts: 16, gf: 17, ga: 12 },
    ]);
    assert.deepEqual(names(out), ['PNI', 'Babito Warriors', 'Valley Talent', 'FC Junda']);
  });

  it('does not mutate inputs and tolerates empty/single/missing values', () => {
    const input = [{ _id: 'a', name: 'A', pts: 3 }];
    const snapshot = JSON.parse(JSON.stringify(input));
    const out = rankTable(input);
    assert.deepEqual(input, snapshot);
    assert.equal(out[0].position, 1);
    assert.deepEqual(rankTable([]), []);
    assert.deepEqual(rankTable(undefined), []);
    const missing = rankTable([{ _id: 'x', name: 'X' }, { _id: 'y', name: 'Y', pts: 1 }]);
    assert.equal(missing[0].name, 'Y');
  });

  it('derives goal difference', () => {
    assert.equal(goalDifferenceOf({ gf: 18, ga: 17 }), 1);
    assert.equal(goalDifferenceOf({}), 0);
  });

  it('builds consistency warnings without blocking', () => {
    assert.deepEqual(buildWarnings({ p: 10, w: 6, d: 1, l: 4, pts: 19 }), ['P (10) != W+D+L (11)']);
    assert.deepEqual(buildWarnings({ p: 11, w: 5, d: 1, l: 5, pts: 17 }), ['PTS (17) != 3W+D (16)']);
    assert.deepEqual(buildWarnings({ p: 11, w: 5, d: 1, l: 5, pts: 16 }), []);
    assert.deepEqual(buildWarnings({}), []);
  });
});
