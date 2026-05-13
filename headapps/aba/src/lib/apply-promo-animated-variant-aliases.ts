import { getComponentMapEntry, type ComponentMapLike } from '@/lib/component-map-get';

/** Variant definition item id (authoring: ABA Promo.yml) */
const ABA_PROMO_VARIANT_ID = '8777bbb3-8528-4ffe-85fe-20b0eb55e331';
/** Variant definition item id (authoring: Full Width Background.yml) */
const FULL_WIDTH_BACKGROUND_VARIANT_ID = 'd5a4329e-6aea-402f-979e-7aa27b535447';

interface VariantAlias {
  implKeys: readonly string[];
  aliasKeys: readonly string[];
}

const PROMO_ANIMATED_VARIANT_ALIASES: readonly VariantAlias[] = [
  {
    implKeys: ['ABAPromo', 'abaPromo'],
    aliasKeys: [
      'ABA Promo',
      `{${ABA_PROMO_VARIANT_ID}}`,
      ABA_PROMO_VARIANT_ID,
      'AbaPromo',
      'ABA_Promo',
      'PromoAnimatedABAPromo',
    ],
  },
  {
    implKeys: ['FullWidthBackground', 'fullWidthBackground'],
    aliasKeys: [
      'Full Width Background',
      `{${FULL_WIDTH_BACKGROUND_VARIANT_ID}}`,
      FULL_WIDTH_BACKGROUND_VARIANT_ID,
      'Full_Width_Background',
      'PromoAnimatedFullWidthBackground',
    ],
  },
];

/**
 * Sitecore passes variant selection as `params.FieldNames` (see placeholder-utils in
 * @sitecore-content-sdk/react). Item names with spaces (e.g. "ABA Promo",
 * "Full Width Background") are not valid ESM export names, so we attach those keys
 * to the PromoAnimated map entry at runtime.
 */
export function applyPromoAnimatedVariantAliases(map: ComponentMapLike): void {
  const promo = getComponentMapEntry(map, 'PromoAnimated');
  if (!promo || typeof promo !== 'object') return;

  const record = promo as Record<string, unknown>;

  for (const { implKeys, aliasKeys } of PROMO_ANIMATED_VARIANT_ALIASES) {
    const impl = implKeys.map((key) => record[key]).find((value) => value !== undefined);
    if (impl === undefined) continue;

    for (const key of aliasKeys) {
      if (record[key] === undefined) {
        record[key] = impl;
      }
    }
  }
}
