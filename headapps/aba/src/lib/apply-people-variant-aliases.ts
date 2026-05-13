import { getComponentMapEntry, type ComponentMapLike } from '@/lib/component-map-get';

/** Headless variant item id (authoring: People / No Image.yml) */
const NO_IMAGE_VARIANT_ID = '9ad4d22a-aefd-4d26-af3d-c5e0a444aee4';

/**
 * Sitecore can pass variant keys using display names with spaces (e.g. "No Image"),
 * which do not match the `NoImage` export on the component module.
 */
export function applyPeopleVariantAliases(map: ComponentMapLike): void {
  const entry = getComponentMapEntry(map, 'People');
  if (!entry || typeof entry !== 'object') return;

  const record = entry as Record<string, unknown>;
  const impl = record.NoImage ?? record.noImage;
  if (impl === undefined) return;

  const aliasKeys: string[] = [
    'No Image',
    `{${NO_IMAGE_VARIANT_ID}}`,
    NO_IMAGE_VARIANT_ID,
    'No_Image',
    'no_image',
  ];

  for (const key of aliasKeys) {
    if (record[key] === undefined) {
      record[key] = impl;
    }
  }
}
