import type { ComponentParams } from '@sitecore-content-sdk/nextjs';
import { Orientation } from '@/enumerations/Orientation.enum';

/**
 * Sitecore / Headless often sends `styles` or `Styles` (layout service casing varies).
 * Values are space-separated Tailwind `@utility` classes (e.g. `indent-top position-center`).
 */
export function peopleRenderingStyleClasses(params: ComponentParams | undefined): string {
  if (!params) return '';
  const record = params as Record<string, unknown>;
  const chunks: string[] = [];
  for (const key of ['styles', 'Styles'] as const) {
    const v = record[key];
    if (typeof v === 'string' && v.trim() !== '') {
      chunks.push(v.trim());
    }
  }
  if (chunks.length === 0) return '';
  return Array.from(new Set(chunks.join(' ').split(/\s+/).filter(Boolean))).join(' ');
}

export type PeopleImageOrientation = 'image-left' | 'image-right';

/**
 * Rendering parameter **Orientation** (Image Left / Image Right), aligned with {@link Orientation} enum
 * and human-readable Sitecore droplist labels.
 */
export function resolvePeopleImageOrientation(params: ComponentParams | undefined): PeopleImageOrientation {
  if (!params) return 'image-right';
  const record = params as Record<string, unknown>;
  const raw =
    record.orientation ??
    record.Orientation ??
    record['Image orientation'] ??
    record['Image Orientation'];

  if (raw === Orientation.IMAGE_LEFT) return 'image-left';
  if (raw === Orientation.IMAGE_RIGHT) return 'image-right';

  const compactKey = String(raw ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  if (compactKey === 'imageleft') return 'image-left';
  if (compactKey === 'imageright') return 'image-right';

  if (compactKey.includes('image') && compactKey.includes('left')) return 'image-left';
  if (compactKey.includes('image') && compactKey.includes('right')) return 'image-right';

  return 'image-right';
}
