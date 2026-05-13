import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';
import {
  getPlainTextFromSitecoreField,
  normalizeLinkFieldForRendering,
} from '@/components/text-banner/text-banner-field-utils';
import type { TopicItemProps } from './topic-listing.props';
import { flattenTopicLinkResultItem, pickTopicLinkFieldValue } from './topic-listing-field-utils';

export const TOPIC_LISTING_EVENTS_DISPLAY_TZ = 'America/New_York';

export type TopicListingEventTypeKey = 'webinar' | 'conference' | 'training' | 'workshop' | 'default';

export interface TopicListingEventRow {
  key: string;
  displayTitle: string;
  displayDescription: string;
  at: Date | null;
  eventTypeLabel: string;
  eventTypeKey: TopicListingEventTypeKey;
  location: string;
  isVirtual: boolean;
  featured: boolean;
  cta?: LinkField;
  raw: TopicItemProps & Record<string, unknown>;
}

function jsonCheckboxToBoolean(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  const v = o.jsonValue !== undefined ? (o.jsonValue as { value?: unknown }).value : o.value;
  if (typeof v === 'boolean') return v;
  if (v === 1 || v === '1') return true;
  if (typeof v === 'string' && v.toLowerCase() === 'true') return true;
  return false;
}

function parseSitecoreCompactDateTimeString(s: string): Date | null {
  const t = s.trim();
  if (!/^\d{8}T\d{6}Z?$/.test(t)) return null;
  const y = t.slice(0, 4);
  const mo = t.slice(4, 6);
  const da = t.slice(6, 8);
  const h = t.slice(9, 11);
  const mi = t.slice(11, 13);
  const se = t.slice(13, 15);
  const d = new Date(`${y}-${mo}-${da}T${h}:${mi}:${se}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseSitecoreDateTime(raw: unknown): Date | null {
  if (!raw || typeof raw !== 'object') return null;
  const jv = (raw as { jsonValue?: { value?: unknown } })?.jsonValue?.value;
  if (typeof jv === 'string' && jv.trim() !== '') {
    const compact = parseSitecoreCompactDateTimeString(jv);
    if (compact) return compact;
    const d = new Date(jv);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (jv && typeof jv === 'object' && 'iso' in (jv as Record<string, unknown>)) {
    const iso = (jv as { iso?: string }).iso;
    if (typeof iso === 'string') {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }
  const plain = getPlainTextFromSitecoreField(raw);
  if (plain) {
    const compact = parseSitecoreCompactDateTimeString(plain);
    if (compact) return compact;
    const d = new Date(plain);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function classifyEventType(label: string): TopicListingEventTypeKey {
  const t = label.trim().toLowerCase();
  if (t.includes('webinar')) return 'webinar';
  if (t.includes('conference')) return 'conference';
  if (t.includes('training')) return 'training';
  if (t.includes('workshop')) return 'workshop';
  return 'default';
}

export function formatEventDateLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TOPIC_LISTING_EVENTS_DISPLAY_TZ,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatEventTimeLabel(date: Date): string {
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: TOPIC_LISTING_EVENTS_DISPLAY_TZ,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
  return `${time} ET`;
}

export function isLikelyVirtualLocation(location: string): boolean {
  return location.trim().toLowerCase().includes('virtual');
}

/**
 * Link anchor text for calendar title fallbacks. Uses {@link normalizeLinkFieldForRendering} first,
 * then reads `jsonValue.value.text` when Edge keeps text only under `jsonValue` (TopicItem does the same).
 */
function topicLinkAnchorText(linkRaw: unknown): string {
  const normalized = normalizeLinkFieldForRendering(linkRaw);
  if (normalized?.value && typeof normalized.value === 'object') {
    const t = (normalized.value as { text?: string }).text;
    if (typeof t === 'string' && t.trim() !== '') return t.trim();
  }
  if (!linkRaw || typeof linkRaw !== 'object') return '';
  const jv = (linkRaw as { jsonValue?: { value?: { text?: string } } }).jsonValue;
  const v = jv?.value;
  if (v && typeof v === 'object' && typeof (v as { text?: string }).text === 'string') {
    const t = (v as { text: string }).text.trim();
    return t || '';
  }
  return '';
}

/** True when the Topic Link field has a usable text or href (rows should not be dropped from the calendar list). */
function topicLinkFieldLooksPopulated(linkRaw: unknown): boolean {
  const normalized = normalizeLinkFieldForRendering(linkRaw);
  if (normalized?.value && typeof normalized.value === 'object') {
    const v = normalized.value as { href?: string; text?: string };
    if (typeof v.text === 'string' && v.text.trim() !== '') return true;
    if (typeof v.href === 'string' && v.href.trim() !== '' && v.href !== 'http://') return true;
  }
  if (!linkRaw || typeof linkRaw !== 'object') return false;
  const jv = (linkRaw as { jsonValue?: { value?: { href?: string; text?: string } } }).jsonValue;
  const v = jv?.value;
  if (v && typeof v === 'object') {
    if (typeof v.text === 'string' && v.text.trim() !== '') return true;
    if (typeof v.href === 'string' && v.href.trim() !== '' && v.href !== 'http://') return true;
  }
  return false;
}

function firstNonEmptyStringProp(obj: Record<string, unknown>, keys: readonly string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function topicRowsFromChildren(
  results: unknown[] | undefined,
  isPageEditing: boolean,
): TopicListingEventRow[] {
  if (!results?.length) return [];

  return results.map((raw, index) => {
    /** Hoist `field` / `fields` / `data.datasource` the same way as {@link TopicItem}. */
    const item = flattenTopicLinkResultItem(raw) as Record<string, unknown>;
    const eventTitleField = (item.eventTitle ??
      item.Title ??
      item.title ??
      pickTopicLinkFieldValue(item, ['eventTitle', 'Title', 'title', 'EventTitle'])) as
      | { jsonValue?: Field<string> }
      | undefined;
    const eventDescField = (item.eventDescription ??
      item.EventDescription ??
      pickTopicLinkFieldValue(item, ['eventDescription', 'EventDescription'])) as
      | { jsonValue?: Field<string> }
      | undefined;
    const dateField = (item.dateAndTime ??
      item.DateAndTime ??
      item.datetime ??
      pickTopicLinkFieldValue(item, ['dateAndTime', 'DateAndTime', 'datetime', 'Date_Time'])) as unknown;
    const locationField = (item.location ??
      item.Location ??
      pickTopicLinkFieldValue(item, ['location', 'Location'])) as { jsonValue?: Field<string> } | undefined;
    const typeField = (item.eventType ??
      item.EventType ??
      pickTopicLinkFieldValue(item, ['eventType', 'EventType'])) as { jsonValue?: Field<string> } | undefined;
    const featuredField = (item.featured ??
      item.Featured ??
      pickTopicLinkFieldValue(item, ['featured', 'Featured'])) as unknown;
    const buttonLinkRaw =
      item.buttonLink ?? item.ButtonLink ?? pickTopicLinkFieldValue(item, ['buttonLink', 'ButtonLink']);
    const linkOptional = item.link ?? item.linkOptional;

    const titleFromEvent = getPlainTextFromSitecoreField(eventTitleField);
    const linkField = normalizeLinkFieldForRendering(linkOptional) as LinkField | undefined;
    const linkText =
      linkField?.value && typeof linkField.value === 'object'
        ? ((linkField.value as { text?: string }).text ?? '').trim()
        : '';
    const linkTextFromRaw = topicLinkAnchorText(linkOptional);
    const displayLinkText = linkText || linkTextFromRaw;
    const fromUrlPath = (() => {
      const url = item.url;
      if (!url || typeof url !== 'object') return '';
      const path = (url as { path?: string }).path;
      if (typeof path !== 'string' || !path.trim()) return '';
      const seg = path.split('/').filter(Boolean).pop();
      if (!seg) return '';
      try {
        return decodeURIComponent(seg).replace(/-/g, ' ').replace(/_/g, ' ').trim();
      } catch {
        return seg.replace(/-/g, ' ').replace(/_/g, ' ').trim();
      }
    })();
    const itemNameFallback =
      firstNonEmptyStringProp(item, [
        'name',
        'Name',
        'displayName',
        'DisplayName',
        'itemName',
        'ItemName',
      ]) || fromUrlPath;
    const displayTitle =
      titleFromEvent ||
      displayLinkText ||
      itemNameFallback ||
      (isPageEditing ? 'Event' : '');

    const descFromEvent = getPlainTextFromSitecoreField(eventDescField);
    const descFromTopicLink = getPlainTextFromSitecoreField(
      (item.description ?? item.Description) as { jsonValue?: Field<string> } | undefined,
    );
    /** Prefer EventName `EventDescription`; use Topic Link `Description` when EventName is empty (matches Default listing). */
    const displayDescription = descFromEvent || descFromTopicLink || '';

    const at = parseSitecoreDateTime(dateField);
    const eventTypeLabel = getPlainTextFromSitecoreField(typeField) || 'Event';
    const location = getPlainTextFromSitecoreField(locationField) || '';
    const featured = jsonCheckboxToBoolean(featuredField);
    const cta: LinkField | undefined =
      normalizeLinkFieldForRendering(buttonLinkRaw) ??
      (linkField?.value ? linkField : undefined) ??
      (topicLinkFieldLooksPopulated(linkOptional) ? (linkOptional as LinkField) : undefined);

    return {
      key: `tl-${index}-${at?.getTime() ?? 'nd'}-${displayTitle || itemNameFallback || 'row'}`,
      displayTitle,
      displayDescription,
      at,
      eventTypeLabel,
      eventTypeKey: classifyEventType(eventTypeLabel),
      location,
      isVirtual: isLikelyVirtualLocation(location),
      featured,
      cta,
      raw: item as TopicItemProps & Record<string, unknown>,
    };
  });
}

export function sortEventsByDateAsc(rows: TopicListingEventRow[]): TopicListingEventRow[] {
  return [...rows].sort((a, b) => {
    if (!a.at && !b.at) return 0;
    if (!a.at) return 1;
    if (!b.at) return -1;
    return a.at.getTime() - b.at.getTime();
  });
}

export function partitionFeatured(rows: TopicListingEventRow[]): {
  featured: TopicListingEventRow[];
  rest: TopicListingEventRow[];
} {
  const featured = sortEventsByDateAsc(rows.filter((r) => r.featured));
  const rest = sortEventsByDateAsc(rows.filter((r) => !r.featured));
  return { featured, rest };
}

export function eventsForCalendarDay(
  rows: TopicListingEventRow[],
  day: number,
  month: number,
  year: number,
): TopicListingEventRow[] {
  return rows.filter((r) => {
    if (!r.at) return false;
    return r.at.getFullYear() === year && r.at.getMonth() === month && r.at.getDate() === day;
  });
}

const BAR_BASE = 'truncate rounded px-1 py-0.5 text-xs font-medium';

export function eventTypeCalendarBarClassName(key: TopicListingEventTypeKey): string {
  switch (key) {
    case 'webinar':
      return `${BAR_BASE} bg-[color:var(--color-topic-listing-events-type-webinar-bg)] text-[color:var(--color-topic-listing-events-bar-fg)]`;
    case 'conference':
      return `${BAR_BASE} bg-[color:var(--color-topic-listing-events-type-conference-bg)] text-[color:var(--color-topic-listing-events-bar-fg)]`;
    case 'training':
      return `${BAR_BASE} bg-[color:var(--color-topic-listing-events-type-training-bg)] text-[color:var(--color-topic-listing-events-bar-fg)]`;
    case 'workshop':
      return `${BAR_BASE} bg-[color:var(--color-topic-listing-events-type-workshop-bg)] text-[color:var(--color-topic-listing-events-bar-fg)]`;
    default:
      return `${BAR_BASE} bg-[color:var(--color-topic-listing-events-type-default-bg)] text-[color:var(--color-topic-listing-events-type-default-fg)]`;
  }
}

const BADGE_BASE = 'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium';

export function eventTypeBadgeClassName(key: TopicListingEventTypeKey): string {
  switch (key) {
    case 'webinar':
      return `${BADGE_BASE} bg-[color:var(--color-topic-listing-events-type-webinar-bg)] text-[color:var(--color-topic-listing-events-type-webinar-fg)]`;
    case 'conference':
      return `${BADGE_BASE} bg-[color:var(--color-topic-listing-events-type-conference-bg)] text-[color:var(--color-topic-listing-events-type-conference-fg)]`;
    case 'training':
      return `${BADGE_BASE} bg-[color:var(--color-topic-listing-events-type-training-bg)] text-[color:var(--color-topic-listing-events-type-training-fg)]`;
    case 'workshop':
      return `${BADGE_BASE} bg-[color:var(--color-topic-listing-events-type-workshop-bg)] text-[color:var(--color-topic-listing-events-type-workshop-fg)]`;
    default:
      return `${BADGE_BASE} bg-[color:var(--color-topic-listing-events-type-default-bg)] text-[color:var(--color-topic-listing-events-type-default-fg)]`;
  }
}

export function rowRenderable(row: TopicListingEventRow, isPageEditing: boolean): boolean {
  if (isPageEditing) return true;
  const raw = row.raw as Record<string, unknown>;
  const linkRaw = raw.link ?? raw.linkOptional;
  return Boolean(
    row.displayTitle?.trim() ||
      row.displayDescription?.trim() ||
      row.location?.trim() ||
      row.cta ||
      row.at ||
      row.featured ||
      topicLinkFieldLooksPopulated(linkRaw),
  );
}
