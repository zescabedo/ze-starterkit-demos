import type { LinkField } from '@sitecore-content-sdk/nextjs';

/** Match Promo / Title: Headless layout often nests datasource fields under `data`. */
export function mergeTextBannerFieldRecord(fields: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!fields) return {};
  const top = { ...fields };
  const data = top.data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const ds = d.datasource;
    const ctx = d.contextItem;
    if (ds && typeof ds === 'object') Object.assign(top, ds as Record<string, unknown>);
    if (ctx && typeof ctx === 'object') Object.assign(top, ctx as Record<string, unknown>);
  }
  return top;
}

export function canonicalFieldKey(key: string): string {
  return key.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Edge / layout often sends link data only under `jsonValue.value` while top-level `value` is empty.
 * Content SDK `Link` + our validators expect a usable `value` object.
 */
export function normalizeLinkFieldForRendering(raw: unknown): LinkField | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as LinkField & { jsonValue?: { value?: LinkField['value'] } };
  const top = o.value;
  const jvVal = o.jsonValue?.value;

  const topObj = top && typeof top === 'object' ? top : null;
  const topHref =
    topObj && typeof (topObj as { href?: string }).href === 'string'
      ? (topObj as { href: string }).href
      : undefined;
  const topUrl =
    topObj && typeof (topObj as { url?: string }).url === 'string'
      ? (topObj as { url: string }).url
      : undefined;
  const topText =
    topObj && typeof (topObj as { text?: string }).text === 'string'
      ? (topObj as { text: string }).text
      : undefined;

  const hasUsableTop =
    (typeof topHref === 'string' && topHref !== '' && topHref !== 'http://') ||
    (typeof topUrl === 'string' && topUrl !== '') ||
    (typeof topText === 'string' && topText.trim() !== '');

  if (hasUsableTop) return o;

  if (jvVal && typeof jvVal === 'object') {
    return { ...o, value: jvVal };
  }

  return undefined;
}

function stripHtmlToPlain(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Plain string from a Sitecore text field (value or jsonValue), for Category* single-line text templates. */
export function getPlainTextFromSitecoreField(raw: unknown): string | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;

  const pick = (s: unknown): string | undefined =>
    typeof s === 'string' && s.trim() !== '' ? s.trim() : undefined;

  const direct = pick(o.value);
  if (direct) return direct;

  const jvRaw = o.jsonValue;
  if (typeof jvRaw === 'string') {
    const s = pick(jvRaw);
    if (s) return s;
  }
  if (jvRaw && typeof jvRaw === 'object') {
    const jv = jvRaw as Record<string, unknown>;
    const fromVal = pick(jv.value);
    if (fromVal) return fromVal;
    const ed = pick(jv.editable);
    if (ed) return stripHtmlToPlain(ed) || undefined;
    const rd = pick(jv.rendered);
    if (rd) return stripHtmlToPlain(rd) || undefined;
  }

  return undefined;
}

export function pickCategoryRawField(merged: Record<string, unknown>, slot: 1 | 2 | 3): unknown {
  const target = `category${slot}`;
  const explicit = [`Category${slot}`, `category${slot}`];
  for (const k of explicit) {
    if (k in merged && merged[k] != null) return merged[k];
  }
  for (const key of Object.keys(merged)) {
    if (canonicalFieldKey(key) === target) return merged[key];
  }
  return undefined;
}
