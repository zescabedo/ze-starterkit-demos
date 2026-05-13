import {
  canonicalFieldKey,
  mergeTextBannerFieldRecord,
} from '@/components/text-banner/text-banner-field-utils';
import type { TopicItemProps, TopicListingFields } from './topic-listing.props';

type Ds = TopicListingFields['data']['datasource'];

/**
 * Picks the first object-shaped field on `item` whose key matches any of `nameHints` after
 * {@link canonicalFieldKey} normalization (covers `EventTitle` vs `eventTitle`, `Title`, etc.).
 */
export function pickTopicLinkFieldValue(
  item: Record<string, unknown>,
  nameHints: readonly string[],
): unknown {
  const wanted = new Set(nameHints.map((h) => canonicalFieldKey(h)));
  for (const [key, val] of Object.entries(item)) {
    if (val == null || typeof val !== 'object') continue;
    if (wanted.has(canonicalFieldKey(key))) return val;
  }
  return undefined;
}

/**
 * Some Edge / layout payloads expose item fields as an array of `{ name, jsonValue }` (or
 * similar) instead of a flat map. Merge those onto `merged` by field name.
 */
function mergeTopicLinkFieldsArrayOntoRecord(
  fieldsArray: unknown[],
  merged: Record<string, unknown>,
): void {
  for (const el of fieldsArray) {
    if (!el || typeof el !== 'object') continue;
    const row = el as Record<string, unknown>;
    const rawName = row.name ?? row.fieldName ?? row.Name;
    if (typeof rawName !== 'string' || !rawName.trim()) continue;
    const fname = rawName.trim();
    if ('jsonValue' in row || 'value' in row) {
      merged[fname] = row;
    }
  }
}

/**
 * Headless / GraphQL often nests the **EventName** template section under `eventName` or
 * `EventName` on the Topic Link item (sibling to Topic Link `linkOptional` fields). Calendar
 * rows must read Title, DateAndTime, etc. from that block — merge it onto the flat record so
 * {@link topicRowsFromChildren} sees the same keys as when fields are top-level on `field`.
 */
function mergeEventNameSectionIntoTopicLinkItem(merged: Record<string, unknown>): void {
  const blocks: unknown[] = [merged.eventName, merged.EventName];
  const field = merged.field;
  if (field && typeof field === 'object') {
    const f = field as Record<string, unknown>;
    blocks.push(f.eventName, f.EventName);
  }
  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue;
    Object.assign(merged, block as Record<string, unknown>);
  }
}

/**
 * Layout / Headless often duplicates datasource keys at the top level of `fields`
 * (see Promo `getMergedFieldRecord` and `mergeTextBannerFieldRecord`).
 */
export function getTopicListingDatasource(fields: TopicListingFields | null | undefined): Ds {
  if (!fields) {
    return {} as Ds;
  }
  const merged = mergeTextBannerFieldRecord(fields as unknown as Record<string, unknown>);
  const fromNested = fields.data?.datasource ?? ({} as Ds);
  const nestedRec = fromNested as Record<string, unknown>;

  const buttonPick =
    merged.button ??
    merged.Button ??
    nestedRec.button ??
    nestedRec.Button;

  const button =
    buttonPick !== undefined && buttonPick !== null ? buttonPick : fromNested.button;

  const nested = fromNested as Record<string, unknown>;
  const titlePick =
    merged.title ??
    merged.titleRequired ??
    nested.title ??
    nested.titleRequired;

  return {
    ...fromNested,
    title: (titlePick ?? fromNested.title) as Ds['title'],
    children: (merged.children ?? fromNested.children) as Ds['children'],
    button: button as Ds['button'],
  };
}

export function flattenTopicLinkResultItem(raw: unknown): TopicItemProps & Record<string, unknown> {
  if (!raw || typeof raw !== 'object') {
    return {} as TopicItemProps & Record<string, unknown>;
  }
  const item = raw as Record<string, unknown>;
  /** `mergeTextBannerFieldRecord` uses `Object.assign(top, datasource)`; enumerable `name: undefined` on the item would wipe a good GraphQL `name`. */
  const preservedItemName =
    typeof item.name === 'string' && item.name.trim() !== '' ? item.name.trim() : undefined;
  const merged = mergeTextBannerFieldRecord({
    ...item,
    data: { datasource: item },
  });
  const nestedField = item.field;
  if (nestedField && typeof nestedField === 'object') {
    Object.assign(merged, nestedField as Record<string, unknown>);
  }
  /** Some Edge / search payloads nest under `fields` instead of `field`. */
  const fieldsBlock = item.fields;
  if (Array.isArray(fieldsBlock)) {
    mergeTopicLinkFieldsArrayOntoRecord(fieldsBlock, merged);
  } else if (fieldsBlock && typeof fieldsBlock === 'object') {
    Object.assign(merged, fieldsBlock as Record<string, unknown>);
  }
  mergeEventNameSectionIntoTopicLinkItem(merged);
  const out = merged as TopicItemProps & Record<string, unknown>;
  const r = out as Record<string, unknown>;
  if (r.Image && !out.image) {
    out.image = r.Image as TopicItemProps['image'];
  }
  if (r.Description && !out.description) {
    out.description = r.Description as TopicItemProps['description'];
  }
  if (r.linkOptional && !out.link) {
    out.link = r.linkOptional as TopicItemProps['link'];
  }
  if (preservedItemName) {
    (out as Record<string, unknown>).name = preservedItemName;
  }
  return out;
}
