// Start Vite locally on port 5173. Use an existing Chromium, Playwright Core,
// and ffmpeg installation. All gallery items and API responses are disposable.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(resolve(process.env.BROWSER_TOOLS_DIR || '.', 'package.json'));
const { chromium } = require('playwright-core');
const origin = 'http://localhost:5173';
const media = [
  { _id: 'p1', type: 'image', caption: 'Landscape test image', url: origin + '/gallery-test/landscape.svg' },
  { _id: 'v1', type: 'video', caption: 'Test clip', url: origin + '/gallery-test/clip.webm' },
  { _id: 'p2', type: 'image', caption: 'Portrait test image', url: origin + '/gallery-test/portrait.svg' },
  { _id: 'p3', type: 'image', caption: 'Unavailable test image', url: 'https://res.cloudinary.com/test/image/upload/v1/broken.svg' }
];
const clip = execFileSync('ffmpeg', [
  '-v', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=160x90:r=24:d=2',
  '-c:v', 'libvpx', '-f', 'webm', 'pipe:1'
]);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium' });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [];
let restoreBroken = false;
const published = [];
const cloudinaryRequests = [];
let galleryItems = media;
page.on('pageerror', error => errors.push(error.message));

try {
  await page.route('**/*', route => {
    const request = route.request();
    const { origin: host, pathname } = new URL(request.url());
    if (host === 'http://localhost:5000') {
      const headers = {
        'access-control-allow-origin': origin,
        'access-control-allow-headers': 'authorization, content-type',
        'access-control-allow-methods': 'GET, POST, OPTIONS'
      };
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
      if (pathname === '/api/admin/login') return route.fulfill({ json: { success: true, token: 'test-only' }, headers });
      if (request.method() === 'POST') {
        assert.equal(request.headers().authorization, 'Bearer test-only');
        if (pathname === '/api/upload') {
          return route.fulfill({ json: { success: true, url: media[0].url }, headers });
        }
        const payload = request.postDataJSON();
        published.push(payload);
        return route.fulfill({ json: { _id: 'new', ...payload }, headers });
      }
      return route.fulfill({ json: pathname === '/api/gallery' ? galleryItems : [], headers });
    }
    if (host === 'https://res.cloudinary.com' && pathname.endsWith('/broken.svg')) {
      cloudinaryRequests.push(request.url());
      if (!restoreBroken || pathname.includes('f_auto,q_auto,w_')) {
        return route.fulfill({ status: 404, headers: { 'cache-control': 'public, max-age=600' } });
      }
      return route.fulfill({
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#24517a"/></svg>',
        contentType: 'image/svg+xml'
      });
    }
    if (host !== origin) return route.abort();
    if (!pathname.startsWith('/gallery-test/')) return route.continue();
    if (pathname.endsWith('clip.webm')) return route.fulfill({ body: clip, contentType: 'video/webm' });
    const [width, height] = pathname.endsWith('portrait.svg') ? [240, 520] : [640, 300];
    const body = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#24517a"/></svg>`;
    return route.fulfill({ body, contentType: 'image/svg+xml' });
  });

  const dialog = page.getByRole('dialog', { name: 'Club image viewer' });
  const close = dialog.getByRole('button', { name: 'Close image viewer' });
  const next = dialog.getByRole('button', { name: 'Next photo' });
  const count = dialog.getByRole('status').filter({ hasText: /\d+ \/ \d+/ });
  const focused = locator => locator.evaluate(element => element === document.activeElement);
  const assertFits = async () => assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

  for (const [width, columns] of [[320, 1], [390, 1], [768, 2], [1280, 3]]) {
    await page.setViewportSize({ width, height: 780 });
    await page.goto(origin + '/gallery');
    const grid = page.locator('.public-gallery__grid');
    await grid.waitFor();
    assert.equal(await grid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length), columns);
    await assertFits();

    const trigger = page.getByRole('button', { name: 'Open image: Landscape test image' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await dialog.waitFor();
    assert.equal(await focused(close), true);
    assert.match(await count.textContent(), /1 \/ 3/);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await focused(next), true);
    await page.keyboard.press('Tab');
    assert.equal(await focused(close), true);
    await page.keyboard.press('ArrowRight');
    await dialog.getByAltText('Portrait test image').waitFor();
    assert.match(await count.textContent(), /2 \/ 3/);
    const image = dialog.getByAltText('Portrait test image');
    assert.equal(await image.evaluate(element => getComputedStyle(element).objectFit), 'contain');
    assert.equal(await image.evaluate(element => parseFloat(getComputedStyle(element).transitionDuration) < .01), true);
    assert.ok((await image.boundingBox()).width <= width);
    assert.ok((await next.boundingBox()).height >= 44);
    await dialog.getByRole('button', { name: 'Previous photo' }).click();
    await dialog.getByAltText('Landscape test image').waitFor();
    await page.keyboard.press('ArrowLeft');
    await dialog.getByText('Image unavailable').waitFor();
    assert.match(await count.textContent(), /3 \/ 3/);
    await page.keyboard.press('ArrowRight');
    await dialog.getByAltText('Landscape test image').waitFor();
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await focused(trigger), true);
    console.log(`${width}px: grid, reflow, focus, navigation, broken image, and reduced motion passed.`);
  }

  const broken = page.getByRole('button', { name: 'Open image: Unavailable test image' });
  await broken.scrollIntoViewIfNeeded();
  await broken.locator('..').getByText('Image unavailable').waitFor();

  function assertFailedPair(offset, explicitRetry = false) {
    const urls = cloudinaryRequests.slice(offset).map(value => new URL(value));
    assert.equal(urls.length, 2);
    assert.match(urls[0].pathname, /f_auto,q_auto,w_/);
    assert.equal(urls[1].pathname, new URL(media[3].url).pathname);
    const retryKey = urls[0].searchParams.get('_junda_retry');
    if (explicitRetry) assert.ok(retryKey);
    else assert.equal(retryKey, null);
    assert.equal(urls[1].searchParams.get('_junda_retry'), retryKey);
  }

  let before = cloudinaryRequests.length;
  await broken.click();
  await dialog.getByText('Image unavailable').waitFor();
  assertFailedPair(before);
  before = cloudinaryRequests.length;
  await page.keyboard.press('ArrowRight');
  await dialog.locator('img.is-loaded').waitFor();
  await page.keyboard.press('ArrowLeft');
  await dialog.getByText('Image unavailable').waitFor();
  assert.equal(await dialog.locator('img').count(), 0);
  assert.equal(cloudinaryRequests.length, before);
  await dialog.getByRole('button', { name: 'Retry image' }).click();
  await dialog.getByText('Image unavailable').waitFor();
  assertFailedPair(before, true);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await focused(broken), true);

  before = cloudinaryRequests.length;
  await broken.click();
  await dialog.getByText('Image unavailable').waitFor();
  assertFailedPair(before);
  restoreBroken = true;
  before = cloudinaryRequests.length;
  await dialog.getByRole('button', { name: 'Retry image' }).click();
  await dialog.locator('img.is-loaded').waitFor();
  assertFailedPair(before, true);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await focused(broken), true);
  console.log('Broken photo: 2 initial requests, 0 on revisit, 2 per retry, and 2 on reopening.');

  const clipElement = page.getByLabel('Test clip');
  assert.equal(await clipElement.evaluate(video => video.controls), true);
  await clipElement.evaluate(video => video.play());
  await page.waitForFunction(() => document.querySelector('video').currentTime > .2);
  console.log('Optimized-to-original fallback, retry, and native video playback passed.');

  galleryItems = [media[0]];
  await page.reload();
  await page.getByRole('button', { name: 'Open image: Landscape test image' }).click();
  await dialog.locator('img.is-loaded').waitFor();
  assert.match(await count.textContent(), /1 \/ 1/);
  assert.equal(await next.count(), 0);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });

  restoreBroken = false;
  galleryItems = [media[3], { ...media[3], _id: 'p4', caption: 'Duplicate URL' }];
  await page.reload();
  for (const name of ['Unavailable test image', 'Duplicate URL']) {
    await page.getByRole('button', { name: `Open image: ${name}` })
      .locator('..').getByText('Image unavailable').waitFor();
  }
  await broken.click();
  await dialog.getByText('Image unavailable').waitFor();
  before = cloudinaryRequests.length;
  await page.keyboard.press('ArrowRight');
  await dialog.getByText('Image unavailable').waitFor();
  assertFailedPair(before);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  galleryItems = media;
  console.log('Single-photo viewer and separate failure state for duplicate URLs passed.');

  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto(origin + '/admin');
  await page.getByLabel('Username').fill('test-only');
  await page.getByLabel('Password', { exact: true }).fill('test-only');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'Gallery', exact: true }).click();
  const url = page.getByLabel('Published media URL');
  await url.fill(media[1].url.replace('clip.webm', 'portrait.svg'));
  await page.getByText('Source: pasted media URL.').waitFor();
  await page.locator('.admin-gallery-preview img.is-loaded').waitFor();
  await page.getByLabel('Upload an image').setInputFiles({
    name: 'audit.png', mimeType: 'image/png', buffer: Buffer.from('mock upload')
  });
  await page.getByText('Source: uploaded image.').waitFor();
  await page.locator('.admin-gallery-preview img.is-loaded').waitFor();
  assert.equal(await url.inputValue(), media[0].url);
  await page.getByLabel('Media Type').selectOption('video');
  assert.equal(await url.inputValue(), '');
  await url.fill(media[0].url);
  await page.getByText(/This is an uploaded image/).waitFor();
  await page.getByRole('button', { name: 'Add to Gallery' }).click();
  await page.getByText(/This URL belongs to an uploaded image/).waitFor();
  assert.equal(published.length, 0);
  await url.fill(media[1].url);
  await page.getByRole('button', { name: 'Add to Gallery' }).click();
  await page.getByText('Gallery item published.').waitFor();
  assert.deepEqual(published, [{ type: 'video', caption: '', url: media[1].url }]);
  await assertFits();
  assert.deepEqual(errors, []);
  console.log('Admin mobile preview, authenticated upload, provenance feedback, and video URL creation passed.');
} finally {
  await browser.close();
}
