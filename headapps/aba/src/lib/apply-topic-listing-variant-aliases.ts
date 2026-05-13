import type { NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';

/** Variant definition item id (authoring: TopicListing/Calendar.yml) */
const TOPIC_LISTING_CALENDAR_VARIANT_ID = '9bc4b2fa-1735-4685-b2e7-ecf55f0436f1';

interface VariantAlias {
  implKeys: readonly string[];
  aliasKeys: readonly string[];
}

const TOPIC_LISTING_VARIANT_ALIASES: readonly VariantAlias[] = [
  {
    implKeys: ['Calendar'],
    aliasKeys: [
      'Calendar',
      `{${TOPIC_LISTING_CALENDAR_VARIANT_ID}}`,
      TOPIC_LISTING_CALENDAR_VARIANT_ID,
      'TopicListingCalendar',
    ],
  },
];

/**
 * Sitecore passes variant selection as `params.FieldNames`. Item names and GUID
 * forms must map to valid ESM exports on `TopicListing`.
 */
export function applyTopicListingVariantAliases(map: Map<string, NextjsContentSdkComponent>): void {
  const topic = map.get('TopicListing');
  if (!topic || typeof topic !== 'object') return;

  const record = topic as Record<string, unknown>;

  for (const { implKeys, aliasKeys } of TOPIC_LISTING_VARIANT_ALIASES) {
    const impl = implKeys.map((key) => record[key]).find((value) => value !== undefined);
    if (impl === undefined) continue;

    for (const key of aliasKeys) {
      if (record[key] === undefined) {
        record[key] = impl;
      }
    }
  }
}
