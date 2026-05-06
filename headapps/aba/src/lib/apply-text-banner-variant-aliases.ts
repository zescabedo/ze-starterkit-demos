import type { NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';

/** Variant definition item id (authoring: TextBanner / Gray Content Left.yml) */
const GRAY_CONTENT_LEFT_VARIANT_ID = '19399b57-b7d8-4f80-b849-5ab81e8b2868';

/**
 * Headless variant item names include spaces (e.g. "Gray Content Left"), which are not valid
 * ESM export names for `GrayContentLeft`. Mirror keys onto the implementation at runtime.
 */
export function applyTextBannerVariantAliases(map: Map<string, NextjsContentSdkComponent>): void {
  const textBanner = map.get('TextBanner');
  if (!textBanner || typeof textBanner !== 'object') return;

  const record = textBanner as Record<string, unknown>;
  const impl = record.GrayContentLeft ?? record.grayContentLeft;
  if (impl === undefined) return;

  const aliasKeys: string[] = [
    'Gray Content Left',
    `{${GRAY_CONTENT_LEFT_VARIANT_ID}}`,
    GRAY_CONTENT_LEFT_VARIANT_ID,
    'Gray_Content_Left',
    'gray_content_left',
  ];

  for (const key of aliasKeys) {
    if (record[key] === undefined) {
      record[key] = impl;
    }
  }
}
