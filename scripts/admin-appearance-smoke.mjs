// Run against local Vite. The admin session and collections are intercepted fixtures.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(resolve(process.env.BROWSER_TOOLS_DIR || '.', 'package.json'));
const { chromium } = require('playwright-core');
const { source: axeSource } = require('axe-core');
const origin = process.env.ADMIN_TEST_ORIGIN || 'http://localhost:5173';
const key = 'junda-admin-appearance';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium' });
const page = await browser.newPage({ colorScheme: 'light', reducedMotion: 'reduce', hasTouch: true });
const errors = [];
const records = {
  news: [{ _id: 'news-1', title: 'Disposable article', content: 'Club news fixture.', date: '2026-11-19' }],
  fixtures: [{ _id: 'fixture-1', opponent: 'Sample FC', status: 'Upcoming', matchDate: '2026-12-01', kickoffTime: '15:00', isHomeMatch: true }],
  standings: [{ _id: 'row-1', name: 'Sample FC', pts: 3 }],
  'standings-tables': [{ _id: 'table-1', category: 'Senior Team', league: 'Sample League', slug: 'sample', teams: [] }],
  players: [
    { _id: 'player-1', name: 'Sample Player', role: 'player', position: 'Forward', squadCategory: 'First Team' },
    { _id: 'staff-1', name: 'Sample Coach', role: 'coach', position: 'Head coach' }
  ],
  gallery: [{ _id: 'gallery-1', caption: 'Sample media', url: origin + '/test-cover.svg', type: 'image' }]
};

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
      return route.fulfill({ json: { success: true, token: 'appearance-test-only' }, headers });
    }
    assert.equal(request.method(), 'GET');
    return route.fulfill({ json: records[url.pathname.split('/').at(-1)] || [], headers });
  });

  const shell = page.locator('.admin-ui');
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  const nav = page.getByRole('navigation', { name: 'Admin navigation' });
  const radio = name => page.getByRole('radio', { name, exact: true });

  async function expectTheme(theme) {
    await page.waitForFunction(value => {
      const root = document.querySelector('.admin-ui');
      return root?.dataset.adminTheme === value && getComputedStyle(root).colorScheme === value;
    }, theme);
  }

  async function goToSection(name) {
    if (!await nav.isVisible()) await menu.click();
    await nav.getByRole('button', { name, exact: true }).click();
    await page.waitForFunction(() => document.activeElement?.matches('.club-admin-header h1'));
  }

  async function expectHeadingFocus(name, keyboard = false) {
    const heading = page.getByRole('heading', { name, exact: true, level: 1 });
    await heading.waitFor();
    await page.waitForFunction(title => {
      const active = document.activeElement;
      return active?.matches('.club-admin-header h1') && active.textContent === title;
    }, name);
    assert.equal(await heading.getAttribute('tabindex'), '-1');
    if (keyboard) {
      assert.ok(await heading.evaluate(node => node.matches(':focus-visible') && getComputedStyle(node).outlineStyle !== 'none'));
    }
  }

  async function checkHeadings(levels) {
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
    assert.deepEqual(await page.locator('#admin-workspace :is(h1,h2,h3,h4,h5,h6)').evaluateAll(
      headings => headings.map(heading => Number(heading.tagName[1]))
    ), levels);
  }

  async function checkReflow(label) {
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label);
  }

  async function audit(label) {
    await page.evaluate(axeSource);
    const problems = await page.evaluate(async () => (await window.axe.run({
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
    })).violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => node.target) })));
    assert.deepEqual(problems, [], label);
    console.log('axe passed:', label);
  }

  const publicSurface = () => page.locator('.editorial').evaluate(node => getComputedStyle(node).backgroundColor);
  await page.goto(origin + '/');
  const originalSurface = await publicSurface();
  await page.evaluate(storageKey => localStorage.setItem(storageKey, 'invalid-choice'), key);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(origin + '/admin');
  const rawTheme = await shell.getAttribute('data-admin-theme');
  assert.equal(rawTheme, 'dark', 'initial admin shell must match System even for invalid storage');
  await expectTheme('dark');
  await page.evaluate(storageKey => localStorage.removeItem(storageKey), key);
  await page.reload();
  assert.equal(await shell.getAttribute('data-admin-theme'), 'dark', 'initial default must follow System');
  await page.getByLabel('Username').fill('fixture');
  await page.getByLabel('Password', { exact: true }).fill('test-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('heading', { name: 'Club overview', exact: true }).waitFor();
  await page.getByText('Junda United vs Sample FC', { exact: true }).waitFor();
  assert.deepEqual(await page.locator('.club-admin-totals strong').allTextContents(), ['1', '1', '1', '2', '1']);
  for (const [shortcut, activation, destination] of [
    [/Articles/, 'Enter', 'Manage News'],
    [/Squad members/, 'Space', 'Manage Squad'],
    [/Matches/, 'click', 'Manage Fixtures']
  ]) {
    const button = page.locator('.club-admin-totals').getByRole('button', { name: shortcut });
    if (activation === 'click') {
      await button.click();
    } else {
      await button.focus();
      await page.keyboard.press(activation);
    }
    await expectHeadingFocus(destination, activation !== 'click');
    await goToSection('Overview');
  }

  await page.setViewportSize({ width: 390, height: 850 });
  await nav.waitFor({ state: 'hidden' });
  await page.locator('.club-admin-totals').getByRole('button', { name: /Media items/ }).tap();
  await expectHeadingFocus('Manage Gallery');
  await menu.tap();
  await nav.getByRole('button', { name: 'News', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expectHeadingFocus('Manage News', true);
  assert.equal(await nav.isVisible(), false);
  await page.getByText('Preview article', { exact: true }).click();
  await page.getByRole('heading', { name: 'Untitled article', level: 3 }).waitFor();
  await checkHeadings([2, 3, 2]);
  console.log('KPI Enter, Space, mouse and touch, plus sidebar keyboard focus and preview headings passed.');

  await goToSection('Appearance');
  assert.equal(await radio('System').isChecked(), true);
  await page.emulateMedia({ colorScheme: 'light' });
  await expectTheme('light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expectTheme('dark');
  await radio('System').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await radio('Light').isChecked(), true);
  await expectTheme('light');
  assert.equal(await page.evaluate(storageKey => localStorage.getItem(storageKey), key), 'light');
  await page.reload();
  assert.equal(await shell.getAttribute('data-admin-theme'), 'light');
  await goToSection('Appearance');
  assert.equal(await radio('Light').isChecked(), true);

  for (const theme of ['Dark', 'Light']) {
    await radio(theme).check();
    await expectTheme(theme.toLowerCase());
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 850 });
      await page.waitForFunction(compact => document.querySelector('.club-admin-nav')?.hidden === compact, width <= 700);
      for (const name of ['Overview', 'News', 'Fixtures', 'Standings', 'Squad', 'Gallery', 'Appearance']) {
        await goToSection(name);
        await checkReflow(theme + ' ' + name + ' ' + width);
        await checkHeadings(name === 'Overview' ? [2, 2, 2] : name === 'Appearance' ? [2] : [2, 2]);
        if (width === 390 && theme === 'Dark' && ['Overview', 'Fixtures', 'Squad', 'Gallery'].includes(name)) {
          await audit(theme + ' ' + name + ' ' + width);
        }
        if (name === 'Standings') {
          await page.getByRole('button', { name: 'Standings tables', exact: true }).click();
          await page.getByRole('button', { name: 'Select', exact: true }).click();
          await checkReflow(theme + ' standings table editor ' + width);
          await checkHeadings([2, 2, 2, 3, 3]);
          await page.getByRole('button', { name: 'Legacy standings', exact: true }).click();
        }
      }
      if (width === 320 || width === 1280) await audit(theme + ' appearance ' + width);
    }
  }

  await radio('Dark').check();
  await page.setViewportSize({ width: 320, height: 850 });
  await nav.waitFor({ state: 'hidden' });
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await nav.getByRole('button', { name: 'Overview', exact: true }).focus();
  await page.keyboard.press('Escape');
  assert.equal(await nav.isVisible(), false);
  assert.equal(await menu.evaluate(node => document.activeElement === node), true);

  await goToSection('News');
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Confirm deletion' });
  assert.equal(await dialog.evaluate(node => getComputedStyle(node).colorScheme), 'dark');
  await audit('dark confirmation dialog');
  await page.keyboard.press('Escape');
  assert.equal(await dialog.isVisible(), false);
  assert.equal(await page.getByRole('button', { name: 'Delete', exact: true }).evaluate(node => document.activeElement === node), true);
  await audit('dark news management');

  await goToSection('Appearance');
  await radio('System').check();
  assert.equal(await page.evaluate(storageKey => localStorage.getItem(storageKey), key), 'system');
  await page.emulateMedia({ colorScheme: 'light' });
  await expectTheme('light');
  await menu.click();
  await nav.getByRole('button', { name: 'Log out', exact: true }).click();
  await page.getByRole('button', { name: 'Sign in', exact: true }).waitFor();
  await expectTheme('light');
  await page.getByRole('link', { name: /Return to club website/ }).click();
  await shell.waitFor({ state: 'detached' });
  assert.equal(await publicSurface(), originalSurface);
  assert.deepEqual(errors, []);
  console.log('Admin appearance, keyboard, persistence, System updates, and all views passed at 320, 390, 768 and 1280 CSS px.');
} finally {
  await browser.close();
}
