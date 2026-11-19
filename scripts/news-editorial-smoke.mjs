// Start the local Vite server on port 5173. This suite intercepts all news
// reads and mutations and uses only disposable image and article fixtures.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(resolve(process.env.BROWSER_TOOLS_DIR || '.', 'package.json'));
const { chromium } = require('playwright-core');
const { source: axeSource } = require('axe-core');
const origin = 'http://localhost:5173';
const base = [
  { _id: 'older', title: 'Training update', date: '11/11/2026', content: 'The team trained.\n\nNext session on Friday.', imageUrl: origin + '/qa-image/broken.jpg' },
  { _id: 'undated', title: 'Club notice', content: 'Travel arrangements are available.' },
  { _id: 'latest', title: 'Full-time at the club grounds', date: '2026-11-19', content: 'The first paragraph.\nSecond line.\n\nThe second paragraph.', imageUrl: 'https://res.cloudinary.com/example/image/upload/v1/editorial.jpg' },
  { _id: 'middle', title: 'Academy weekend', date: '2026-11-13', content: 'A report from the weekend.' }
];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium' });
const context = await browser.newContext({ reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
page.setDefaultTimeout(7000);
const apiHeaders = { 'access-control-allow-origin': origin, 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'GET, POST, PUT, OPTIONS' };
const image = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="#224a70"/></svg>';
const errors = [];
const mutations = [];
let articles = [...base];
let newsError = false;
let waitForNews;

page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  if (message.type() === 'error' && message.text().includes('Objects are not valid as a React child')) {
    errors.push(message.text());
  }
});
await context.addInitScript(() => Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }));

try {
  await page.route('**/*', async route => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.origin === 'http://localhost:5000') {
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: apiHeaders });
      if (url.pathname === '/api/admin/login') return route.fulfill({ json: { success: true, token: 'test-only' }, headers: apiHeaders });
      if (req.method() === 'GET') {
        if (url.pathname !== '/api/news') return route.fulfill({ json: [], headers: apiHeaders });
        if (waitForNews) await waitForNews;
        return route.fulfill({ status: newsError ? 500 : 200, json: newsError ? { error: 'Test error' } : articles, headers: apiHeaders });
      }
      assert.equal(req.headers().authorization, 'Bearer test-only');
      if (url.pathname === '/api/upload') return route.fulfill({ json: { success: true, url: origin + '/qa-image/cover.svg' }, headers: apiHeaders });
      const payload = req.postDataJSON();
      mutations.push({ method: req.method(), path: url.pathname, payload });
      const saved = { ...payload, _id: req.method() === 'POST' ? 'created' : url.pathname.split('/').at(-1) };
      return route.fulfill({ status: req.method() === 'POST' ? 201 : 200, json: saved, headers: apiHeaders });
    }
    if (url.hostname === 'res.cloudinary.com') return route.fulfill({ body: image, contentType: 'image/svg+xml' });
    if (url.origin !== origin) return route.abort();
    if (url.pathname === '/qa-image/broken.jpg') return route.fulfill({ status: 404 });
    if (url.pathname === '/qa-image/cover.svg') return route.fulfill({ body: image, contentType: 'image/svg+xml' });
    return route.continue();
  });

  async function checkReflow() {
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }

  async function audit(label) {
    await page.evaluate(axeSource);
    const violations = await page.evaluate(async () => (await window.axe.run({
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
    })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })));
    assert.deepEqual(violations, [], label);
    console.log(`axe: ${label}, zero violations`);
  }

  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 840 });
    await page.goto(origin + '/');
    const lead = page.locator('.editorial-story--featured');
    const latest = lead.getByRole('link', { name: base[2].title });
    await latest.waitFor();
    assert.deepEqual(await page.locator('.editorial-grid h3').allTextContents(), [
      base[3].title, base[0].title, base[1].title
    ]);
    assert.equal(await lead.locator('time').getAttribute('datetime'), '2026-11-19');
    assert.equal(await lead.locator('img').getAttribute('fetchpriority'), 'high');
    assert.match(await lead.locator('img').getAttribute('srcset'), /w_800,c_limit/);
    assert.equal(await page.locator('.editorial-grid img').first().getAttribute('loading'), 'lazy');
    const broken = page.locator('.editorial-story').filter({ hasText: base[0].title });
    await broken.scrollIntoViewIfNeeded();
    await broken.locator('.news-image--fallback').waitFor();
    assert.equal(await page.locator('.editorial-story').filter({ hasText: base[1].title }).locator('time').count(), 0);
    await checkReflow();
    if (width === 320 || width === 1280) await audit('news ' + width);

    await latest.focus();
    assert.equal(await latest.evaluate(link => getComputedStyle(link).outlineStyle), 'solid');
    await page.keyboard.press('Enter');
    await page.getByRole('heading', { name: base[2].title, exact: true, level: 1 }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/news/latest');
    assert.deepEqual(await page.locator('.editorial-prose p').allTextContents(), ['The first paragraph.\nSecond line.', 'The second paragraph.']);
    assert.equal(await page.title(), base[2].title + ' | Junda United FC');
    assert.equal(await page.locator('meta[property="og:type"]').getAttribute('content'), 'article');
    assert.match(await page.locator('link[rel="canonical"]').getAttribute('href'), /\/news\/latest$/);
    assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), base[2].imageUrl);
    assert.equal(await page.locator('meta[property="article:published_time"]').getAttribute('content'), '2026-11-19');
    assert.equal(await page.locator('.editorial-related a').count(), 3);
    await checkReflow();
    if (width === 320 || width === 1280) await audit('article ' + width);
    if (width === 390) {
      await page.getByRole('button', { name: 'Share article' }).click();
      await page.getByText('Article link copied.').waitFor();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), origin + '/news/latest');
      assert.match(await page.getByRole('link', { name: 'Share on WhatsApp' }).getAttribute('href'), /wa\.me/);
      await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
        configurable: true, value: { writeText: async () => { throw new Error('Clipboard unavailable'); } }
      }));
      await page.getByRole('button', { name: 'Share article' }).click();
      await page.getByText('Could not copy the link.', { exact: false }).waitFor();
    }
    await page.getByRole('link', { name: base[0].title }).click();
    await page.getByRole('heading', { name: base[0].title, exact: true, level: 1 }).waitFor();
    await page.locator('.editorial-article__hero .news-image--fallback').waitFor();
    await page.getByRole('link', { name: 'Back to club news' }).click();
    await page.getByRole('heading', { name: 'Club News', exact: true }).waitFor();
    console.log(`${width}px: chronology, reflow, keyboard, article navigation, metadata and image fallback passed.`);
  }

  const invalidDate = { ...base[0], date: '31/02/2026' };
  articles = [
    invalidDate, { ...base[3] }, { ...base[3] }, base[1],
    { title: 'Missing ID', date: '2026-11-14' },
    { _id: 'bad/id', title: 'Malformed ID', date: '2026-11-15' },
    { ...base[2] }, { _id: 'extra', title: 'Extra record', date: '2026-11-10' }
  ];
  await page.goto(origin + '/news/older');
  await page.getByRole('heading', { name: invalidDate.title, level: 1 }).waitFor();
  assert.equal(await page.locator('.editorial-article-header .editorial-date').count(), 0);
  assert.equal(await page.locator('meta[property="article:published_time"]').count(), 0);
  assert.deepEqual(await page.locator('.editorial-related a').evaluateAll(links => links.map(link => link.getAttribute('href'))), [
    '/news/latest', '/news/middle', '/news/extra'
  ]);

  articles = [invalidDate, base[2], base[1]];
  await page.goto(origin + '/');
  await page.locator('.editorial-story--featured time').getByText('19 November 2026').waitFor();
  assert.equal(await page.locator('.editorial-grid .editorial-date').count(), 0);
  assert.equal(await page.getByText('31/02/2026', { exact: true }).count(), 0);
  console.log('Invalid publication dates are hidden and related links are distinct, ordered and limited.');

  for (const date of ['31 February 2026', '2026.02.31', '29 February 2025', 'February 31, 2026', 'February 31 2026']) {
    articles = [base[2], { ...base[0], date }];
    await page.goto(origin + '/');
    const card = page.locator('.editorial-grid article').filter({ hasText: base[0].title });
    await card.waitFor();
    assert.equal(await card.locator('.editorial-date, time').count(), 0);
    assert.equal(await page.getByText(date, { exact: true }).count(), 0);

    await page.goto(origin + '/news/older');
    await page.getByRole('heading', { name: base[0].title, level: 1 }).waitFor();
    assert.equal(await page.locator('.editorial-article-header .editorial-date, .editorial-article-header time').count(), 0);
    assert.equal(await page.locator('meta[property="article:published_time"]').count(), 0);
    assert.equal(await page.getByText(date, { exact: true }).count(), 0);
  }
  console.log('Impossible named-month and dotted dates are absent from cards, article headers, and metadata.');

  for (const malformed of [null, { ...base[3], title: { invalid: true } }]) {
    articles = [base[2], malformed];
    await page.goto(origin + '/');
    await page.locator('.editorial-story--featured').getByRole('heading', { name: base[2].title }).waitFor();
    assert.equal(await page.locator('.editorial-grid').count(), 0);

    await page.goto(origin + '/news/latest');
    await page.getByRole('heading', { name: base[2].title, level: 1 }).waitFor();
    assert.equal(await page.locator('.editorial-related a').count(), 0);
    assert.deepEqual(await page.locator('.editorial-prose p').allTextContents(), [
      'The first paragraph.\nSecond line.', 'The second paragraph.'
    ]);
  }

  articles = [null, { ...base[3], title: {} }];
  await page.goto(origin + '/');
  await page.getByRole('heading', { name: 'No news posted yet' }).waitFor();

  articles = { invalid: [] };
  await page.goto(origin + '/news/latest');
  await page.getByRole('heading', { name: 'Unable to load this article.' }).waitFor();
  articles = [base[2]];
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('heading', { name: base[2].title, level: 1 }).waitFor();
  console.log('Malformed feed entries, all-invalid empty state, and non-array response recovery passed.');

  articles = [base[2]];
  await page.goto(origin + '/');
  await page.getByRole('heading', { name: base[2].title }).waitFor();
  assert.equal(await page.locator('.editorial-grid').count(), 0);
  await page.goto(origin + '/news/latest');
  await page.getByRole('heading', { name: base[2].title }).waitFor();
  assert.equal(await page.locator('.editorial-related').count(), 0);
  articles = [];
  await page.goto(origin + '/');
  await page.getByRole('heading', { name: 'No news posted yet' }).waitFor();
  await page.goto(origin + '/news/missing');
  await page.getByRole('heading', { name: 'Article not found' }).waitFor();

  let release;
  waitForNews = new Promise(resolveResponse => { release = resolveResponse; });
  await page.goto(origin + '/', { waitUntil: 'domcontentloaded' });
  await page.getByText('Loading the latest club news…').waitFor();
  newsError = true;
  waitForNews = undefined;
  release();
  await page.getByRole('alert').getByText('Unable to load club news.').waitFor();
  articles = [...base];
  newsError = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('heading', { name: base[2].title }).waitFor();
  newsError = true;
  await page.goto(origin + '/news/latest');
  await page.getByRole('heading', { name: 'Unable to load this article.' }).waitFor();
  newsError = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('heading', { name: base[2].title }).waitFor();
  console.log('Single story, empty collection, deep links, loading, and error recovery passed.');

  await page.setViewportSize({ width: 320, height: 840 });
  await page.goto(origin + '/admin');
  await page.getByLabel('Username').fill('test-only');
  await page.getByLabel('Password', { exact: true }).fill('test-only');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'News', exact: true }).click();
  await page.getByLabel('Article Title').fill('Draft headline');
  await page.getByLabel('Article Content').fill('Draft paragraph.');
  await page.getByText('Preview article', { exact: true }).click();
  const preview = page.getByRole('article', { name: 'Article draft preview' });
  await preview.getByRole('heading', { name: 'Draft headline' }).waitFor();
  assert.equal(mutations.length, 0);
  await page.getByLabel('Cover image (optional)').setInputFiles({
    name: 'cover.png', mimeType: 'image/png', buffer: Buffer.from('mock upload')
  });
  await preview.getByAltText('Cover image preview').waitFor();
  await checkReflow();
  await audit('admin news preview 320');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await page.getByText('Article published.').waitFor();
  const created = mutations[0];
  assert.equal(created.method, 'POST');
  assert.deepEqual(Object.keys(created.payload).sort(), ['content', 'date', 'imageUrl', 'title']);
  assert.equal(created.payload.imageUrl, origin + '/qa-image/cover.svg');
  const row = page.locator('.admin-list__row').filter({ hasText: 'Draft headline' });
  await row.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('Article Title').fill('Edited headline');
  await preview.getByRole('heading', { name: 'Edited headline' }).waitFor();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByText('Article updated.').waitFor();
  assert.deepEqual(mutations[1], { method: 'PUT', path: '/api/news/created', payload: { ...created.payload, title: 'Edited headline' } });
  assert.deepEqual(errors, []);
  console.log('Authenticated admin preview, image upload, create and edit payloads passed.');
} finally {
  await browser.close();
}
