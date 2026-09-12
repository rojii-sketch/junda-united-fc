const baseUrl = (process.argv[2] || 'https://junda-united-fc.vercel.app').replace(/\/+$/, '');

const checks = [];

async function request(url) {
  const response = await fetch(url, { redirect: 'manual' });
  const body = await response.text();
  return {
    path: url,
    status: response.status,
    contentType: response.headers.get('content-type') || '',
    body
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function record(label, result) {
  checks.push(`${label}: ${result}`);
}

function isHtml(contentType) {
  return contentType.toLowerCase().includes('text/html');
}

function isJavaScript(contentType) {
  return /javascript|ecmascript/.test(contentType.toLowerCase());
}

function isCss(contentType) {
  return contentType.toLowerCase().includes('text/css');
}

function resolveAssetUrl(reference) {
  return new URL(reference, `${baseUrl}/`);
}

try {
  const homepage = await request(resolveAssetUrl('/'));
  assert(homepage.status === 200, `homepage returned HTTP ${homepage.status}`);
  assert(isHtml(homepage.contentType), `homepage content type was ${homepage.contentType}`);
  assert(homepage.body.includes('<div id="root"></div>'), 'homepage is missing the application shell');
  record('homepage', 'HTTP 200 HTML application shell');

  const assetReferences = [
    ...homepage.body.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:[?#][^"']*)?)["']/g)
  ].map((match) => match[1]);
  assert(assetReferences.length > 0, 'homepage did not reference JS or CSS assets');

  for (const reference of [...new Set(assetReferences)]) {
    const assetUrl = resolveAssetUrl(reference);
    const asset = await request(assetUrl);
    assert(asset.status === 200, `${assetUrl} returned HTTP ${asset.status}`);
    const validType = assetUrl.pathname.endsWith('.js')
      ? isJavaScript(asset.contentType)
      : isCss(asset.contentType);
    assert(validType, `${assetUrl} returned unexpected content type ${asset.contentType}`);
    record(assetUrl.href, `HTTP 200 ${asset.contentType}`);
  }

  const missingJavaScript = await request(resolveAssetUrl('/assets/phase53-definitely-missing.js'));
  assert(missingJavaScript.status === 404, `missing JS returned HTTP ${missingJavaScript.status}`);
  assert(!isHtml(missingJavaScript.contentType), 'missing JS returned HTML');
  assert(!missingJavaScript.body.includes('<div id="root"></div>'), 'missing JS returned the application shell');
  record('missing JavaScript', 'HTTP 404 without HTML fallback');

  const missingCss = await request(resolveAssetUrl('/assets/phase53-definitely-missing.css'));
  assert(missingCss.status === 404, `missing CSS returned HTTP ${missingCss.status}`);
  assert(!isHtml(missingCss.contentType), 'missing CSS returned HTML');
  assert(!missingCss.body.includes('<div id="root"></div>'), 'missing CSS returned the application shell');
  record('missing CSS', 'HTTP 404 without HTML fallback');

  const spaRoute = await request(resolveAssetUrl('/news/phase53-smoke-test'));
  assert(spaRoute.status === 200, `SPA route returned HTTP ${spaRoute.status}`);
  assert(isHtml(spaRoute.contentType), `SPA route content type was ${spaRoute.contentType}`);
  assert(spaRoute.body.includes('<div id="root"></div>'), 'SPA route did not return the application shell');
  record('SPA route', 'HTTP 200 HTML application shell');

  const serviceWorker = await request(resolveAssetUrl('/sw.js'));
  assert(serviceWorker.status === 200, `service worker returned HTTP ${serviceWorker.status}`);
  assert(isJavaScript(serviceWorker.contentType), `service worker content type was ${serviceWorker.contentType}`);
  record('service worker', `HTTP 200 ${serviceWorker.contentType}`);

  const manifest = await request(resolveAssetUrl('/manifest.webmanifest'));
  assert(manifest.status === 200, `manifest returned HTTP ${manifest.status}`);
  assert(manifest.contentType.toLowerCase().includes('manifest+json') || manifest.contentType.toLowerCase().includes('json'), `manifest content type was ${manifest.contentType}`);
  record('manifest', `HTTP 200 ${manifest.contentType}`);

  console.log(`Deployment smoke checks passed for ${baseUrl}`);
  for (const check of checks) console.log(`- ${check}`);
} catch (error) {
  console.error(`Deployment smoke checks failed for ${baseUrl}: ${error.message}`);
  for (const check of checks) console.error(`- ${check}`);
  process.exitCode = 1;
}
