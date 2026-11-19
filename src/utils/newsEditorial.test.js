import assert from 'node:assert/strict';
import test from 'node:test';
import { articlePath, classifyPublicationDate, newsExcerpt, newsImageUrl, newsParagraphs, normalizeNewsCollection, orderNews, publicationDate, relatedNews } from './newsEditorial.js';

test('formats known calendar dates and timestamps without shifting date-only values', () => {
  assert.deepEqual(publicationDate('05/11/2026'), publicationDate('2026-11-05'));
  for (const date of ['05-11-2026', '2026.11.05', '5 November 2026', '5 NOVEMBER 2026', 'November 5 2026', 'Nov. 5, 2026']) {
    assert.deepEqual(publicationDate(date), publicationDate('2026-11-05'));
  }
  assert.equal(publicationDate('2026-11-05').label, '5 November 2026');
  assert.equal(publicationDate('2026-11-05T23:00:00Z').label, '6 November 2026');
  assert.equal(publicationDate('2026-11-05T23:00:00Z').dateTime, '2026-11-05T23:00:00.000Z');
});

test('omits impossible dates without normalizing them to valid calendar days', () => {
  for (const date of ['31/02/2026', '2026-02-31', '2026-02-29T08:00Z', '31-04-2026', '2026-13-01', '0000-01-01',
    '2026-2-31', '2026-02-31 08:00', '31 February 2026', '2026.02.31',
    'February 31, 2026', 'February 31 2026', 'February 29, 2025', 'Feb. 30, 2026',
    '29 February 2025', '29 February 1900', '02.03.2026', '28/28/2026', '2026-00-01', '2026-01-00', '2026.04.31']) {
    assert.deepEqual(publicationDate(date), { label: '' });
  }
  for (const date of ['29-02-2024', '29 February 2024', 'February 29, 2024', '2024.02.29']) {
    assert.deepEqual(publicationDate(date), publicationDate('2024-02-29'));
  }
  assert.equal(publicationDate('29 February 2024').label, '29 February 2024');
  assert.deepEqual(publicationDate('February 28, 2026'), publicationDate('2026-02-28'));
  assert.equal(publicationDate('28 February 2026').label, '28 February 2026');
  assert.equal(publicationDate('30/04/2026').dateTime, '2026-04-30');
  assert.equal(publicationDate('29 February 2000').dateTime, '2000-02-29');
});

test('keeps textual legacy labels intact and leaves missing dates blank', () => {
  assert.deepEqual(publicationDate('After the cup final'), { label: 'After the cup final' });
  for (const date of [undefined, null, 20260228, {}, '', '   ', '2026-05-03T08:00']) {
    assert.deepEqual(publicationDate(date), { label: '' });
  }
});

test('classifies valid dates, invalid dates, legacy labels and empty inputs separately', () => {
  assert.equal(classifyPublicationDate('February 29, 2024').kind, 'VALID_DATE');
  assert.deepEqual(classifyPublicationDate('February 29, 2025'), { kind: 'INVALID_DATE' });
  assert.deepEqual(classifyPublicationDate('After the cup final'), { kind: 'LEGACY_TEXT', label: 'After the cup final' });
  for (const value of [undefined, null, ' ', 10, {}]) {
    assert.deepEqual(classifyPublicationDate(value), { kind: 'EMPTY' });
  }
});

test('sorts newest publication first and keeps source order for ties and unknown dates', () => {
  const stories = [
    { _id: 'undated' }, { _id: 'old', date: '05/11/2026' }, { _id: 'first', date: '2026-11-19' },
    { _id: 'invalid', date: '31/02/2026' }, { _id: 'unknown', date: 'November' }, { _id: 'second', date: '19 November 2026' },
    { _id: 'invalid-dotted', date: '2026.02.31' }, { _id: 'third', date: 'November 19, 2026' },
    { _id: 'invalid-month-first', date: 'February 31, 2026' }
  ];
  assert.deepEqual(orderNews(stories).map(item => item._id), ['first', 'second', 'third', 'old', 'undated', 'invalid', 'unknown', 'invalid-dotted', 'invalid-month-first']);
  assert.equal(stories[0]._id, 'undated');
});

test('keeps line breaks for reading and avoids cutting Unicode characters in excerpts', () => {
  assert.deepEqual(newsParagraphs(' First line\r\nSecond line\r\n \r\nNext paragraph '), ['First line\nSecond line', 'Next paragraph']);
  assert.equal(newsExcerpt(' One \n two  three four ', 13), 'One two…');
  assert.equal(newsExcerpt('⚽😀😀😀', 3), '⚽😀…');
});

test('preserves deep links and resolves only HTTP or HTTPS image addresses', () => {
  assert.equal(articlePath('one two'), '/news/one%20two');
  assert.equal(newsImageUrl('/covers/news.jpg', 'https://club.example'), 'https://club.example/covers/news.jpg');
  assert.equal(newsImageUrl('https://cdn.example/test.jpg?token=abc', 'https://club.example'), 'https://cdn.example/test.jpg?token=abc');
  assert.equal(newsImageUrl('javascript:alert(1)', 'https://club.example'), undefined);
  assert.equal(newsImageUrl('https://user:pass@cdn.example/test.jpg', 'https://club.example'), undefined);
});

test('selects the first three distinct routable articles in feed order', () => {
  const current = { _id: 'current' };
  const first = { _id: 'wide' };
  const second = { _id: 'second' };
  const third = { _id: 'third' };
  assert.deepEqual(relatedNews([current, first, { ...first }, {}, { _id: 12 }, { _id: 'bad/id' },
    { _id: ' ' }, second, current, third, { _id: 'fourth' }], current._id), [first, second, third]);
  assert.deepEqual(relatedNews([current, second, first], current._id), [second, first]);
});

test('normalizes feed entries without changing valid editorial fields or IDs', () => {
  const valid = {
    _id: '675ac1d94a964bb16d612450', title: ' Match report ',
    content: 'First paragraph.\n\nSecond paragraph.', imageUrl: '/cover.webp', date: '19/11/2026'
  };
  const malformedDate = { ...valid, _id: 'bad-date', date: { value: 'today' } };
  const invalid = [null, undefined, [], 42, 'news', true, {}, { ...valid, _id: 'missing/title', title: {} },
    { ...valid, _id: 'bad-title', title: {} }, { ...valid, _id: 'blank-title', title: ' ' },
    { ...valid, _id: undefined }, { ...valid, _id: 5 }, { ...valid, _id: 'bad/id' }];

  const result = normalizeNewsCollection([...invalid, valid, { ...valid, title: 'Duplicate' }, malformedDate]);
  assert.deepEqual(result, [valid, { ...malformedDate, date: undefined }]);
  assert.deepEqual(orderNews(result).map(article => article._id), [valid._id, malformedDate._id]);
  assert.equal(articlePath(result[0]._id), '/news/' + valid._id);
  assert.deepEqual(normalizeNewsCollection(invalid), []);
  assert.deepEqual(normalizeNewsCollection([]), []);
});

test('rejects responses that violate the collection contract', () => {
  for (const response of [null, undefined, {}, { articles: [] }, 'news']) {
    assert.throws(() => normalizeNewsCollection(response), TypeError);
  }
});
