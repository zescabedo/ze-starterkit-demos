import type { ImageField } from '@sitecore-content-sdk/nextjs';

const DEFAULT_MEDIA_ORIGIN = 'https://edge-platform.sitecorecloud.io';

function normalizeOrigin(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\/$/, '');
  }
  return `https://${trimmed.replace(/\/$/, '')}`;
}

/**
 * Host used to turn root-relative `/-/media` paths into absolute URLs.
 * Use your tenant media origin (often `https://xmc-….sitecorecloud.io`), **not** the GraphQL
 * platform URL (`NEXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME`).
 */
function getEdgeMediaOrigin(): string {
  const media = process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN?.trim();
  if (media) return normalizeOrigin(media);
  return DEFAULT_MEDIA_ORIGIN;
}

/**
 * Root-relative Sitecore media (`/-/media/...`, `/-/jssmedia/...`) must be resolved to an
 * absolute URL on the rendering host; otherwise the browser requests them from the Next.js
 * origin (e.g. localhost) and they 404. Experience Editor often still shows media because CM
 * resolves URLs differently.
 */
export function normalizeSitecoreMediaSrc(src: string | undefined | null): string {
  if (src == null || typeof src !== 'string') return '';
  let s = src.trim();
  if (!s) return '';

  s = s.replace(/^https?:\/\/cm\//i, '/');

  if (s.startsWith('//')) {
    return `https:${s}`;
  }
  if (/^https?:\/\//i.test(s)) {
    return s;
  }

  if (s.startsWith('/-/')) {
    const origin = getEdgeMediaOrigin();
    return `${origin}${s}`;
  }

  return s;
}

export function normalizeSitecoreImageField(image: ImageField | undefined): ImageField | undefined {
  if (!image?.value || typeof image.value !== 'object') {
    return image;
  }
  const v = image.value as { src?: unknown; [key: string]: unknown };
  const src = v.src;
  if (typeof src !== 'string' || !src) {
    return image;
  }
  const nextSrc = normalizeSitecoreMediaSrc(src);
  if (nextSrc === src) {
    return image;
  }
  return { ...image, value: { ...v, src: nextSrc } };
}
