import { getComponentMapEntry, type ComponentMapLike } from '@/lib/component-map-get';

/** Variant definition item id (authoring: Promo / No Image Compressed.yml) */
const NO_IMAGE_COMPRESSED_VARIANT_ID = '31c589fe-ccd1-4bf9-89f3-352715618792';

/**
 * Sitecore passes variant selection using display names with spaces (e.g. "No Image Compressed"),
 * which cannot match `NoImageCompressed` on the component module. Attach alternate keys at runtime.
 */
export function applyPromoVariantAliases(map: ComponentMapLike): void {
  const promo = getComponentMapEntry(map, 'Promo');
  if (!promo || typeof promo !== 'object') return;

  const record = promo as Record<string, unknown>;
  const impl = record.NoImageCompressed ?? record.noImageCompressed;
  if (impl === undefined) return;

  const aliasKeys: string[] = [
    'No Image Compressed',
    `{${NO_IMAGE_COMPRESSED_VARIANT_ID}}`,
    NO_IMAGE_COMPRESSED_VARIANT_ID,
    'No_Image_Compressed',
    'no_image_compressed',
  ];

  for (const key of aliasKeys) {
    if (record[key] === undefined) {
      record[key] = impl;
    }
  }
}
