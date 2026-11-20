// Run against local Vite. All application API requests use disposable fixtures.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(resolve(process.env.BROWSER_TOOLS_DIR || '.', 'package.json'));
const { chromium } = require('playwright-core');
const { source: axeSource } = require('axe-core');
const origin = process.env.BRANDING_TEST_ORIGIN || 'http://localhost:5173';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium' });
const page = await browser.newPage({ reducedMotion: 'reduce', hasTouch: true });
const article = { _id: 'brand-story', title: 'Club fixture article', date: '2026-11-19', content: 'A local fixture.' };
const player = { _id: 'brand-player', name: 'Sample Player', position: 'Forward', role: 'player', squadCategory: 'First Team' };
const errors = [];
let newsStatus = 200;
let newsDelay;

page.on('pageerror', error => errors.push(error.message));

try {
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin) return route.continue();
    if (url.origin !== 'http://localhost:5000') return route.abort();

    const headers = {
      'access-control-allow-origin': origin,
      'access-control-allow-headers': 'authorization, content-type',
      'access-control-allow-methods': 'GET, POST, OPTIONS'
    };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (url.pathname === '/api/admin/login') {
      return route.fulfill({ json: { success: true, token: 'branding-test-only' }, headers });
    }
    assert.equal(request.method(), 'GET');
    if (url.pathname === '/api/news') {
      if (newsDelay) await newsDelay;
      return route.fulfill({ status: newsStatus, json: newsStatus === 200 ? [article] : { error: 'Test error' }, headers });
    }
    const json = url.pathname === '/api/players' ? [player] : [];
    return route.fulfill({ json, headers });
  });

  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  const footer = page.getByRole('contentinfo');
  const heading = name => page.getByRole('heading', { name, level: 1, exact: true });
  const menu = page.getByRole('button', { name: /navigation menu/ });

  async function checkCrests() {
    const images = await page.locator('.club-crest').evaluateAll(nodes => nodes.map(node => ({
      src: node.getAttribute('src'), width: Number(node.getAttribute('width')), height: Number(node.getAttribute('height'))
    })));
    assert.ok(images.length);
    for (const { src, width, height } of images) {
      assert.equal(src, '/junda-logo.webp');
      assert.equal(height, Math.round(width * 655 / 1200));
    }
  }

  async function checkReflow(label) {
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label);
  }

  async function checkFooterContinuity() {
    assert.ok(await page.evaluate(() => Math.abs(document.querySelector('footer').getBoundingClientRect().top
      - document.querySelector('#public-content').getBoundingClientRect().bottom) <= 1));
  }

  async function audit(label) {
    await page.evaluate(axeSource);
    const violations = await page.evaluate(async () => (await window.axe.run({
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
    })).violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })));
    assert.deepEqual(violations, [], label);
    console.log('axe passed:', label);
  }

  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 840 });
    await page.goto(origin + '/');
    await heading('Club News').waitFor();
    await checkCrests();
    await checkReflow(width + ' news');
    await checkFooterContinuity();
    assert.equal(await page.getByRole('banner').count(), 1);
    assert.equal(await page.getByRole('main').count(), 1);
    assert.equal(await nav.locator('.club-crest').getAttribute('alt'), '');
    assert.equal(await footer.getByRole('link', { name: 'Facebook' }).count(), 1);

    if (width < 1280) {
      await menu.waitFor();
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');
      assert.equal(await nav.getByRole('link', { name: 'News', exact: true }).count(), 0);
      const box = await menu.boundingBox();
      assert.ok(box.width >= 44 && box.height >= 44);
      await menu.focus();
      await page.keyboard.press('Enter');
      assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Tab');
      assert.equal(await nav.getByRole('link', { name: 'News', exact: true }).evaluate(node => node === document.activeElement), true);
      assert.equal(await nav.getByRole('link', { name: 'News', exact: true }).getAttribute('aria-current'), 'page');
      if (width === 390) await audit('open mobile navigation');
      await page.keyboard.press('Escape');
      assert.equal(await menu.evaluate(node => node === document.activeElement), true);
      assert.equal(await nav.getByRole('link', { name: 'News', exact: true }).count(), 0);
      await page.keyboard.press('Space');
      assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Shift+Tab');
      const brand = nav.getByRole('link', { name: 'Junda United FC', exact: true });
      assert.equal(await brand.evaluate(node => node === document.activeElement), true);
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');

      await menu.click();
      await nav.getByRole('link', { name: 'Squad', exact: true }).focus();
      await page.keyboard.press('Tab');
      const next = page.getByRole('main').getByRole('link', { name: 'Match Centre', exact: true });
      assert.equal(await next.evaluate(node => node === document.activeElement), true);
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');
      assert.equal(await nav.getByRole('link', { name: 'Squad', exact: true }).count(), 0);

      await menu.click();
      await heading('Club News').click();
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');

      await menu.click();
      const squad = nav.getByRole('link', { name: 'Squad', exact: true });
      await squad.focus();
      await page.setViewportSize({ width: 1280, height: 840 });
      await menu.waitFor({ state: 'detached' });
      await page.waitForFunction(() => document.activeElement?.matches('nav[aria-label="Primary navigation"] a[href="/squad"]'));
      await checkReflow('after focused breakpoint change');
      await page.setViewportSize({ width, height: 840 });
      await menu.waitFor();
      await next.focus();
      await page.setViewportSize({ width: 1280, height: 840 });
      await menu.waitFor({ state: 'detached' });
      assert.equal(await next.evaluate(node => node === document.activeElement), true);
      await page.setViewportSize({ width, height: 840 });
      await menu.waitFor();
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');
      await menu.tap();
      await nav.getByRole('link', { name: 'Gallery', exact: true }).tap();
      await heading('Club gallery').waitFor();
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');
      await page.waitForFunction(() => document.activeElement?.id === 'public-content');
      await page.goBack();
      await heading('Club News').waitFor();
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    } else {
      assert.equal(await menu.count(), 0);
      assert.equal(await nav.getByRole('link', { name: 'News', exact: true }).getAttribute('aria-current'), 'page');
      await audit('desktop navigation and footer');
      const zoom = await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      assert.ok(await nav.evaluate(node => node.scrollWidth <= node.clientWidth + 1));
      await zoom.evaluate(node => node.remove());
    }

    await footer.getByRole('link', { name: 'Standings', exact: true }).click();
    await heading('Match Centre').waitFor();
    await page.waitForFunction(() => document.activeElement?.id === 'standings');
    assert.equal(new URL(page.url()).hash, '#standings');
    assert.equal(await page.locator('header.public-navbar').evaluate(node => getComputedStyle(node).position), 'static');
    await checkReflow(width + ' standings');
    await checkFooterContinuity();
  }

  await page.setViewportSize({ width: 1280, height: 840 });
  for (const [path, title, active] of [
    ['/news/' + article._id, article.title, 'News'],
    ['/squad', 'Club squad', 'Squad'],
    ['/squad/' + player._id, player.name, 'Squad'],
    ['/nonexistent', 'Page not found', null]
  ]) {
    await page.goto(origin + path);
    if (path === '/squad') {
      await page.locator('.public-squad').waitFor();
    } else {
      await heading(title).waitFor();
    }
    await checkCrests();
    await checkReflow(path);
    await checkFooterContinuity();
    if (active) assert.ok(await nav.getByRole('link', { name: active, exact: true }).getAttribute('aria-current'));
    else assert.equal(await nav.locator('[aria-current]').count(), 0);
  }

  await page.setViewportSize({ width: 320, height: 840 });
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await menu.click();
  for (const root of [nav, footer]) {
    assert.ok(await root.evaluate(node => node.scrollWidth <= node.clientWidth + 1), 'shared chrome at 200% root text size');
  }
  await page.keyboard.press('Escape');

  let releaseNews;
  newsDelay = new Promise(resolveNews => { releaseNews = resolveNews; });
  newsStatus = 500;
  await page.goto(origin + '/', { waitUntil: 'domcontentloaded' });
  await page.getByText('Loading the latest club news…').waitFor();
  await checkCrests();
  releaseNews();
  newsDelay = undefined;
  await page.getByText('Unable to load club news.', { exact: true }).waitFor();
  await checkFooterContinuity();
  newsStatus = 200;

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(origin + '/admin');
  await heading('Club administration').waitFor();
  assert.equal(await page.locator('.club-admin-login').getAttribute('data-admin-theme'), 'dark');
  await checkCrests();
  assert.equal(await nav.count(), 0);
  assert.equal(await footer.count(), 0);
  await page.getByLabel('Username').fill('fixture');
  await page.getByLabel('Password', { exact: true }).fill('test-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await heading('Club overview').waitFor();
  await checkReflow('mobile admin with crest');
  await audit('mobile admin branding');
  await page.setViewportSize({ width: 1280, height: 840 });
  const adminNav = page.getByRole('navigation', { name: 'Admin navigation' });
  await adminNav.waitFor();
  assert.equal(await page.locator('.club-admin-sidebar .club-crest').isVisible(), true);
  assert.equal(await page.getByRole('img', { name: 'Junda United FC crest', exact: true }).isVisible(), true);
  await adminNav.getByRole('button', { name: 'Appearance', exact: true }).click();
  await page.getByRole('radio', { name: 'Light', exact: true }).check();
  assert.equal(await page.locator('.club-admin').getAttribute('data-admin-theme'), 'light');
  await checkCrests();
  assert.deepEqual(errors, []);
  console.log('Branding, navigation, and viewport checks passed at 320, 390, 768, and 1280 CSS px.');
} finally {
  await browser.close();
}
