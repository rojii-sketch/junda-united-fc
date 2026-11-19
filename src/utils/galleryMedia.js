import { getCloudinarySrcSet, transformCloudinaryUrl } from './cloudinary.js';

function publicCloudinaryImage(url) {
  try {
    const parsed = new URL(url);
    // Preserve signed paths and pre-existing query parameters. A query can
    // contain a delivery token or a signature covering the requested URL.
    if (parsed.protocol === 'https:' && parsed.hostname === 'res.cloudinary.com'
      && parsed.pathname.includes('/image/upload/')
      && !parsed.username && !parsed.password && !parsed.search
      && !/\/s--[\w-]+--\//.test(parsed.pathname)) {
      return parsed;
    }
  } catch {
    // Relative and invalid URLs are left to the browser unchanged.
  }
  return null;
}

export function galleryRetryUrl(url, retryKey) {
  if (!retryKey) return url;
  const parsed = publicCloudinaryImage(url);
  if (!parsed) return url;
  parsed.searchParams.set('_junda_retry', retryKey);
  return parsed.href;
}

export function galleryImageSources(url, width, widths, retryKey) {
  if (!publicCloudinaryImage(url)) return { src: url };

  const requestUrl = galleryRetryUrl(url, retryKey);
  const src = transformCloudinaryUrl(requestUrl, `f_auto,q_auto,w_${width},c_limit`);
  // Authored transformations must not advertise identical responsive candidates.
  if (src === requestUrl) return { src };
  return { src, srcSet: getCloudinarySrcSet(requestUrl, widths) || undefined };
}
