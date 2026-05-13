import { normalizeSitecoreImageField, normalizeSitecoreMediaSrc } from '@/lib/sitecore-image-src';
import type { ImageField } from '@sitecore-content-sdk/nextjs';

describe('normalizeSitecoreMediaSrc', () => {
  const prevMedia = process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN;

  afterEach(() => {
    if (prevMedia === undefined) {
      delete process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN;
    } else {
      process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN = prevMedia;
    }
  });

  it('returns empty for nullish or blank', () => {
    expect(normalizeSitecoreMediaSrc(undefined)).toBe('');
    expect(normalizeSitecoreMediaSrc(null)).toBe('');
    expect(normalizeSitecoreMediaSrc('   ')).toBe('');
  });

  it('prefixes root-relative Sitecore media with NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN', () => {
    process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN = 'https://xmc-example.sitecorecloud.io';
    expect(normalizeSitecoreMediaSrc('/-/media/foo.png')).toBe(
      'https://xmc-example.sitecorecloud.io/-/media/foo.png',
    );
    expect(normalizeSitecoreMediaSrc('/-/jssmedia/bar.jpg')).toBe(
      'https://xmc-example.sitecorecloud.io/-/jssmedia/bar.jpg',
    );
  });

  it('defaults media origin when env is unset', () => {
    delete process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN;
    expect(normalizeSitecoreMediaSrc('/-/media/a.png')).toBe(
      'https://edge-platform.sitecorecloud.io/-/media/a.png',
    );
  });

  it('accepts hostname-only MEDIA_ORIGIN (adds https)', () => {
    process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN = 'xmc-example.sitecorecloud.io';
    expect(normalizeSitecoreMediaSrc('/-/media/x')).toBe(
      'https://xmc-example.sitecorecloud.io/-/media/x',
    );
  });

  it('does not rewrite absolute http(s) URLs', () => {
    expect(normalizeSitecoreMediaSrc('https://edge-1.sitecorecloud.io/-/media/z')).toBe(
      'https://edge-1.sitecorecloud.io/-/media/z',
    );
  });

  it('rewrites protocol-relative URLs to https', () => {
    expect(normalizeSitecoreMediaSrc('//cdn.example.com/img.png')).toBe(
      'https://cdn.example.com/img.png',
    );
  });

  it('strips CM host then prefixes edge for /-/ paths', () => {
    process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN = 'https://xmc-example.sitecorecloud.io';
    expect(normalizeSitecoreMediaSrc('http://cm/-/media/a.png')).toBe(
      'https://xmc-example.sitecorecloud.io/-/media/a.png',
    );
  });

  it('does not rewrite app-relative paths that are not Sitecore media roots', () => {
    expect(normalizeSitecoreMediaSrc('/images/promo.jpg')).toBe('/images/promo.jpg');
  });
});

describe('normalizeSitecoreImageField', () => {
  const prevMedia = process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN;

  afterEach(() => {
    if (prevMedia === undefined) {
      delete process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN;
    } else {
      process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN = prevMedia;
    }
  });

  it('returns undefined when field is undefined', () => {
    expect(normalizeSitecoreImageField(undefined)).toBeUndefined();
  });

  it('returns the same reference when src is unchanged', () => {
    const field: ImageField = {
      value: { src: 'https://xmc.sitecorecloud.io/-/media/x', alt: 'x', width: 1, height: 1 },
    };
    expect(normalizeSitecoreImageField(field)).toBe(field);
  });

  it('returns a shallow copy with rewritten src when needed', () => {
    process.env.NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN = 'https://tenant.sitecorecloud.io';
    const field: ImageField = {
      value: { src: '/-/media/logo.svg', alt: 'Logo', width: 100, height: 40 },
    };
    const out = normalizeSitecoreImageField(field);
    expect(out).not.toBe(field);
    expect(out?.value).toEqual({
      src: 'https://tenant.sitecorecloud.io/-/media/logo.svg',
      alt: 'Logo',
      width: 100,
      height: 40,
    });
  });
});
