import assert from 'node:assert/strict';
import test from 'node:test';
import { fixtureSchedule, parseMatchDate } from './fixtureInput.js';

test('fixture controls serialize the existing date and EAT time contract', () => {
  assert.deepEqual(fixtureSchedule('2026-07-18', '16:00'), {
    matchDate: '18/07/2026', kickoffTime: '16:00 EAT'
  });
  assert.deepEqual(fixtureSchedule('2028-02-29', ''), {
    matchDate: '29/02/2028', kickoffTime: ''
  });
});

test('fixture dates sort by calendar date and tolerate older representations', () => {
  assert.ok(parseMatchDate('02/12/2026') > parseMatchDate('29/11/2026'));
  assert.equal(parseMatchDate('31/02/2026'), null);
  assert.ok(parseMatchDate('2026-12-02') instanceof Date);
  assert.equal(parseMatchDate('TBC'), null);
});
