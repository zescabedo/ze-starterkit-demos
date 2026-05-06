import { mergeTextBannerFieldRecord } from '@/components/text-banner/text-banner-field-utils';
import type { TopicItemProps, TopicListingFields } from './topic-listing.props';

type Ds = TopicListingFields['data']['datasource'];

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
  const merged = mergeTextBannerFieldRecord({
    ...item,
    data: { datasource: item },
  });
  const nestedField = item.field;
  if (nestedField && typeof nestedField === 'object') {
    Object.assign(merged, nestedField as Record<string, unknown>);
  }
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
  return out;
}
