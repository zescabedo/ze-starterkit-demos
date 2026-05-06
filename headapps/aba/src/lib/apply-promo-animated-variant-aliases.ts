import type { NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';

/** Variant definition item id (authoring: ABA Promo.yml) */
const ABA_PROMO_VARIANT_ID = '8777bbb3-8528-4ffe-85fe-20b0eb55e331';

/**
 * Sitecore passes variant selection as `params.FieldNames` (see placeholder-utils in
 * @sitecore-content-sdk/react). Item names with spaces (e.g. "ABA Promo") are not valid
 * ESM export names, so we attach those keys to the PromoAnimated map entry at runtime.
 */
export function applyPromoAnimatedVariantAliases(
  map: Map<string, NextjsContentSdkComponent>
): void {
  const promo = map.get('PromoAnimated');
  if (!promo || typeof promo !== 'object') return;

  const record = promo as Record<string, unknown>;
  const impl = record.ABAPromo ?? record.abaPromo;
  if (impl === undefined) return;

  const aliasKeys: string[] = [
    'ABA Promo',
    `{${ABA_PROMO_VARIANT_ID}}`,
    ABA_PROMO_VARIANT_ID,
    'AbaPromo',
    'ABA_Promo',
    'PromoAnimatedABAPromo',
  ];

  for (const key of aliasKeys) {
    if (record[key] === undefined) {
      record[key] = impl;
    }
  }
}
