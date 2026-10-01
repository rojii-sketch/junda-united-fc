// src/utils/standingsRanking.test.js
// Mirror tests for the FRONTEND defensive copy (JUNDA-STANDINGS-RANK-001).
// Must stay in sync with backend/tests/standingsRanking.test.js.
// Run: node --test src/utils/standingsRanking.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rankTable, buildWarnings, goalDifferenceOf } from './standingsRanking.js';

const names = (rows) => rows.map((t) => t.name);
const positions = (rows) => rows.map((t) => t.position);

describe('standingsRanking (frontend mirror)', () => {
  it('orders by points descending regardless of stored rank or input order', () => {
    const out = rankTable([
      { _id: 'c', name: 'C', rank: 1, pts: 18, gf: 10, ga: 10 },
      { _id: 'a', name: 'A', rank: 7, pts: 25, gf: 10, ga: 10 },
      { _id: 'b', name: 'B', rank: 2, pts: 20, gf: 10, ga: 10 },
    ]);
    assert.deepEqual(names(out), ['A', 'B', 'C']);
    assert.deepEqual(positions(out), [1, 2, 3]);
  });

  it('breaks equal-points ties by goal difference, then goals scored', () => {
    assert.equal(rankTable([
      { _id: 'b', name: 'B', pts: 20, gf: 13, ga: 10 },
      { _id: 'a', name: 'A', pts: 20, gf: 18, ga: 10 },
    ])[0].name, 'A');
    assert.equal(rankTable([
      { _id: 'b', name: 'B', pts: 20, gf: 14, ga: 9 },
      { _id: 'a', name: 'A', pts: 20, gf: 18, ga: 13 },
    ])[0].name, 'A');
  });

  it('shares position on complete sporting ties and numbers 1,2,2,4', () => {
    const tied = rankTable([
      { _id: 'b', name: 'B', pts: 20, gf: 18, ga: 13 },
      { _id: 'a', name: 'A', pts: 20, gf: 18, ga: 13 },
    ]);
    assert.deepEqual(positions(tied), [1, 1]);
    const table = rankTable([
      { _id: 'd', name: 'D', pts: 18, gf: 5, ga: 5 },
      { _id: 'c', name: 'C', pts: 20, gf: 10, ga: 5 },
      { _id: 'b', name: 'B', pts: 20, gf: 10, ga: 5 },
      { _id: 'a', name: 'A', pts: 25, gf: 5, ga: 5 },
    ]);
    assert.deepEqual(positions(table), [1, 2, 2, 4]);
  });

  it('tolerates old/cached payloads without position and never mutates inputs', () => {
    const input = [{ _id: 'a', name: 'A', rank: 7, pts: 3 }];
    const out = rankTable(input);
    assert.equal(out[0].position, 1);
    assert.equal(input[0].position, undefined);
    assert.deepEqual(rankTable([]), []);
  });

  it('derives goal difference and builds warnings', () => {
    assert.equal(goalDifferenceOf({ gf: 18, ga: 17 }), 1);
    assert.deepEqual(buildWarnings({ p: 10, w: 6, d: 1, l: 4, pts: 19 }), ['P (10) != W+D+L (11)']);
    assert.deepEqual(buildWarnings({ p: 11, w: 5, d: 1, l: 5, pts: 16 }), []);
  });
});
