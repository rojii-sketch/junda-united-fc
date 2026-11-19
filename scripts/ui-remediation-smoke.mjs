// Run against local Vite with an existing Playwright/Chromium installation.
// BROWSER_TOOLS_DIR points to the directory containing node_modules.
// The intercepted API uses disposable in-memory fixtures and test tokens.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(resolve(process.env.BROWSER_TOOLS_DIR || '.', 'package.json'));
const { chromium } = require('playwright-core');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium' });
const origin = 'http://localhost:5173';
const page = await browser.newPage({ viewport: { width: 1280, height: 850 }, reducedMotion: 'reduce' });
const news = ['First', 'Second', 'Third'].map((title, index) => ({
  _id: String(index), title, date: '2026-11-19', content: 'Disposable browser test'
}));
const player = { _id: 'p1', name: 'Sample player', role: 'player', position: 'Forward', squadCategory: 'First Team' };
const team = { _id: 'team', name: 'Sample club', p: 1, w: 1, d: 0, l: 0, gf: 1, ga: 0, pts: 3, position: 1 };
const tables = [{ _id: 'table', category: 'Sample league', slug: 'sample', league: 'Sample', teams: [team] }];
const submissions = [];
let expired = false;
const requestOverrides = new Map();

function delayRequest(collection) {
  let release;
  let started;
  const waiting = new Promise(resolve => { release = resolve; });
  const received = new Promise(resolve => { started = resolve; });
  requestOverrides.set(collection, async ({ reply }) => {
    started();
    const { body, status } = await waiting;
    return reply(body, status);
  });
  return { received, release };
}

try {
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin) return route.continue();
    if (url.origin !== 'http://localhost:5000') return route.abort();
    const headers = {
      'access-control-allow-origin': origin,
      'access-control-allow-headers': 'authorization, content-type',
      'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS'
    };
    const reply = (json, status = 200) => route.fulfill({ json, status, headers });
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });

    const [, , collection, id, subcollection] = url.pathname.split('/');
    if (collection === 'admin') {
      const { username } = request.postDataJSON();
      return reply({ success: true, token: `mock-${username}` });
    }
    if (request.method() === 'GET') {
      const collections = { news, players: [player], 'standings-tables': tables };
      return reply(collections[collection] || []);
    }
    const override = requestOverrides.get(collection);
    if (override) {
      requestOverrides.delete(collection);
      assert.match(request.headers().authorization, /^Bearer mock-/);
      return override({ reply, route });
    }
    if (collection === 'upload') return reply({ success: true, url: `${origin}/junda-logo.webp` });
    if (collection === 'gallery' && request.method() === 'POST') {
      const payload = request.postDataJSON();
      submissions.push(payload);
      return reply({ ...payload, _id: String(submissions.length) });
    }
    if (request.method() === 'DELETE' && collection === 'news') {
      news.splice(news.findIndex(item => item._id === id), 1);
      return reply({ success: true });
    }
    if (request.method() === 'DELETE' && collection === 'standings-tables') {
      if (expired) return reply({ error: 'Expired' }, 401);
      if (subcollection === 'teams') tables[0].teams = [];
      else tables.length = 0;
      return reply({ success: true });
    }
    return reply({ error: 'Unexpected test request' }, 400);
  });

  const heading = name => page.getByRole('heading', { name, exact: true });
  const nav = page.getByRole('navigation', { name: 'Admin navigation' });
  const select = name => nav.getByRole('button', { name, exact: true }).click();
  const checkFocus = locator => locator.evaluate(node => node === document.activeElement);
  const removeButton = title => page.locator('.admin-list__row').filter({ hasText: title })
    .getByRole('button', { name: 'Delete', exact: true });

  async function signIn(username) {
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password', { exact: true }).fill('test-only');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await heading('Club overview').waitFor();
  }

  async function openDelete(trigger) {
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Confirm deletion' });
    await dialog.waitFor();
    assert.equal(await checkFocus(dialog.getByRole('button', { name: 'Cancel' })), true);
    return dialog;
  }

  async function confirmDelete(trigger) {
    const dialog = await openDelete(trigger);
    await page.keyboard.press('Tab');
    assert.equal(await checkFocus(dialog.getByRole('button', { name: 'Delete', exact: true })), true);
    await page.keyboard.press('Enter');
    await trigger.waitFor({ state: 'detached' });
  }

  async function waitForFocus(locator) {
    await locator.waitFor();
    await page.waitForFunction(node => node === document.activeElement, await locator.elementHandle());
  }

  await page.goto(origin + '/admin');
  await signIn('first');
  await select('News');
  await page.getByLabel('Article Title').fill('Private draft');
  await select('Fixtures');
  await page.getByLabel('Opponent Team Name').fill('Private opponent');
  await select('Log out');
  await heading('Club administration').waitFor();
  assert.equal(await page.evaluate(() => sessionStorage.getItem('junda_jwt')), null);
  assert.equal(await page.getByLabel('Username').inputValue(), '');
  await signIn('second');
  await select('News');
  assert.equal(await page.getByLabel('Article Title').inputValue(), '');
  await select('Fixtures');
  assert.equal(await page.getByLabel('Opponent Team Name').inputValue(), '');
  await select('Standings');
  await page.getByRole('button', { name: 'Select', exact: true }).click();
  expired = true;
  await openDelete(removeButton('Sample club'));
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.getByText('Your session has expired. Sign in again to continue.').waitFor();
  assert.equal(await page.evaluate(() => sessionStorage.getItem('junda_jwt')), null);
  await signIn('third');
  await select('Standings');
  await page.getByRole('button', { name: 'Select', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Selected', exact: true }).count(), 0);
  console.log('R1 passed: same-tab logout, session expiry and fresh sign-in');

  await select('Gallery');
  const url = page.getByLabel('Published media URL');
  const type = page.getByLabel('Media Type');
  const submit = page.getByRole('button', { name: 'Add to Gallery' });
  const upload = () => page.getByLabel('Upload an image').setInputFiles({
    name: 'sample.png', mimeType: 'image/png', buffer: Buffer.from('mock upload')
  });
  await upload();
  await page.getByText('Image uploaded. Save the form to publish it.').waitFor();
  await type.selectOption('video');
  assert.equal(await url.inputValue(), '');
  assert.equal(await page.getByLabel('Upload an image').isDisabled(), true);
  await submit.click();
  assert.equal(await url.evaluate(node => node.validity.valueMissing), true);
  assert.equal(submissions.length, 0);
  await url.fill(origin + '/junda-logo.webp');
  await submit.click();
  await page.getByText('This URL belongs to an uploaded image.', { exact: false }).waitFor();
  assert.equal(submissions.length, 0);
  await url.fill('https://example.test/match.webm');
  await submit.click();
  await page.getByText('Gallery item published.').waitFor();
  await upload();
  await page.getByText('Image uploaded. Save the form to publish it.').waitFor();
  await submit.click();
  await page.getByText('Gallery item published.').waitFor();
  assert.deepEqual(submissions, [
    { type: 'video', url: 'https://example.test/match.webm', caption: '' },
    { type: 'image', url: origin + '/junda-logo.webp', caption: '' }
  ]);
  await select('Log out');
  await signIn('fourth');
  await select('Gallery');
  await type.selectOption('video');
  await url.fill(origin + '/junda-logo.webp');
  await submit.click();
  await page.getByText('Gallery item published.').waitFor();
  assert.deepEqual(submissions[2], { type: 'video', url: origin + '/junda-logo.webp', caption: '' });
  console.log('R2 passed: known upload rejected after re-paste, valid payloads, and session-local provenance');

  async function publishNews(title) {
    await select('News');
    await page.getByLabel('Article Title').fill(title);
    await page.getByLabel('Article Content').fill('Disposable draft');
    await page.locator('.admin-form button[type=submit]').click();
  }

  async function expectExpiry() {
    await page.getByText('Your session has expired. Sign in again to continue.').waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('junda_jwt')), null);
  }

  for (const status of [403, 500, 'network']) {
    const error = `Test error ${status}`;
    requestOverrides.set('news', ({ reply, route }) => status === 'network'
      ? route.abort()
      : reply({ error }, status));
    await publishNews('Draft survives failures');
    await page.getByRole('alert').getByText(status === 'network' ? 'Failed to save article.' : error).waitFor();
    assert.equal(await page.getByLabel('Article Title').inputValue(), 'Draft survives failures');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('junda_jwt')), 'mock-fourth');
  }

  const delayedNews = delayRequest('news');
  await publishNews('Expiring draft');
  await delayedNews.received;
  const delayedUpload = delayRequest('upload');
  await select('Gallery');
  await upload();
  await delayedUpload.received;
  delayedNews.release({ status: 401, body: { error: 'Expired' } });
  await expectExpiry();
  await signIn('fifth');
  await select('News');
  assert.equal(await page.getByLabel('Article Title').inputValue(), '');
  const oldUpload = page.waitForResponse(response => response.url().endsWith('/api/upload') && response.status() === 401);
  delayedUpload.release({ status: 401, body: { error: 'Expired' } });
  await (await oldUpload).finished();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.evaluate(() => sessionStorage.getItem('junda_jwt')), 'mock-fifth');

  const delayedSuccess = delayRequest('news');
  await publishNews('Previous account draft');
  await delayedSuccess.received;
  await select('Log out');
  await signIn('sixth');
  await select('News');
  const oldNews = page.waitForResponse(response => response.url().endsWith('/api/news') && response.status() === 201);
  delayedSuccess.release({ status: 201, body: { _id: 'old', title: 'Previous account response', content: 'Disposable' } });
  await (await oldNews).finished();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.getByText('Previous account response').count(), 0);
  assert.equal(await page.getByLabel('Article Title').inputValue(), '');

  requestOverrides.set('upload', ({ reply }) => reply({ error: 'Expired' }, 401));
  await select('Gallery');
  await upload();
  await expectExpiry();
  await signIn('seventh');
  console.log('R1 passed: news and upload expiry, concurrent stale 401, delayed success, and 403/500/network failures');

  await select('News');
  const first = removeButton('First');
  await openDelete(first);
  await page.keyboard.press('Escape');
  await waitForFocus(first);
  await confirmDelete(first);
  await waitForFocus(removeButton('Second'));
  await confirmDelete(removeButton('Third'));
  await waitForFocus(removeButton('Second'));
  await confirmDelete(removeButton('Second'));
  await waitForFocus(heading('Current Articles (0)'));

  expired = false;
  await select('Standings');
  await page.getByRole('button', { name: 'Select', exact: true }).click();
  await confirmDelete(removeButton('Sample club'));
  await waitForFocus(heading('Teams (0)'));
  await confirmDelete(removeButton('Sample league'));
  await waitForFocus(heading('Existing Standings Tables (0)'));
  console.log('R3 passed: cancel, next row, previous row, empty list and standings focus');

  tables.push({ _id: 'public-table', category: 'League table', slug: 'public-table', league: 'Sample', teams: [team] });
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    for (const path of ['/missing', '/fixtures#standings']) {
      await page.goto(origin + path);
      const selector = path === '/missing' ? 'main' : '#standings';
      await page.locator(selector).waitFor();
      if (path.includes('#standings')) await page.getByRole('table').waitFor();
      const gap = await page.evaluate(() => document.querySelector('footer').getBoundingClientRect().top
        - document.querySelector('#public-content').getBoundingClientRect().bottom);
      assert.ok(Math.abs(gap) <= 1, `Footer gap at ${width}px on ${path}: ${gap}`);
    }
    await page.goto(origin + '/squad/p1');
    await heading('Sample player').waitFor();
    const placeholder = await page.locator('.public-player-profile__image-card--placeholder').boundingBox();
    if (width < 768) assert.ok(placeholder.height <= 130);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  await page.setViewportSize({ width: 320, height: 850 });
  await page.goto(origin + '/admin');
  await heading('Club overview').waitFor();
  const metrics = await page.locator('.club-admin-totals button').evaluateAll(buttons =>
    buttons.map(button => ({ x: button.offsetLeft, height: button.getBoundingClientRect().height })));
  assert.equal(new Set(metrics.map(metric => metric.x)).size, 2);
  assert.ok(metrics.every(metric => metric.height >= 44));
  assert.ok((await heading('Upcoming fixtures').boundingBox()).y < 600);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  console.log('R4–R5 passed: footer continuity and responsive layout at 320–1280px');
} finally {
  await browser.close();
}
