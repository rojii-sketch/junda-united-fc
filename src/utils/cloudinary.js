const CLOUDINARY_UPLOAD_PATH = '/image/upload/';
const TRANSFORMATION_SEGMENT = /^(?:f_|q_|w_|h_|c_|g_|dpr_|fl_|ar_|t_|l_|e_|so_|du_)/;

export function transformCloudinaryUrl(url, transformation) {
  if (typeof url !== 'string' || !url || typeof transformation !== 'string' || !transformation.trim()) {
    return url;
  }

  if (!url.includes('res.cloudinary.com/')) {
    return url;
  }

  const uploadIndex = url.indexOf(CLOUDINARY_UPLOAD_PATH);
  if (uploadIndex === -1) {
    return url;
  }

  const transformationValue = transformation.trim();
  const pathAfterUpload = url.slice(uploadIndex + CLOUDINARY_UPLOAD_PATH.length);
  const firstPathSegment = pathAfterUpload.split('/')[0];

  if (
    firstPathSegment === transformationValue ||
    TRANSFORMATION_SEGMENT.test(firstPathSegment)
  ) {
    return url;
  }

  return url.replace(
    CLOUDINARY_UPLOAD_PATH,
    `${CLOUDINARY_UPLOAD_PATH}${transformationValue}/`
  );
}

export function getCloudinarySrcSet(url, widths) {
  if (
    typeof url !== 'string' ||
    !url ||
    !url.includes('res.cloudinary.com/') ||
    !url.includes(CLOUDINARY_UPLOAD_PATH) ||
    !Array.isArray(widths)
  ) {
    return '';
  }

  const uniqueWidths = [...new Set(
    widths.filter(width => Number.isInteger(width) && width > 0)
  )].sort((first, second) => first - second);

  return uniqueWidths
    .map(width => `${transformCloudinaryUrl(url, `f_auto,q_auto,w_${width},c_limit`)} ${width}w`)
    .join(', ');
}
