import React, { JSX } from 'react';
import {
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
  Text as ContentSdkText,
  ImageField,
  Field,
  LinkField,
} from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';

interface Fields {
  PromoIcon: ImageField;
  PromoText: Field<string>;
  PromoLink: LinkField;
  PromoText2: Field<string>;
  PromoText3?: Field<string>;
  /** Alternate datasource field names (see No Image Compressed variant) */
  Text?: Field<string>;
  text?: Field<string>;
  'Text 2'?: Field<string>;
  'Text 3'?: Field<string>;
  'text 2'?: Field<string>;
  'text 3'?: Field<string>;
  Text2?: Field<string>;
  Text3?: Field<string>;
  Link?: LinkField;
  link?: LinkField;
  /** Some renderings nest datasource fields under `data` (same pattern as `Title.tsx`) */
  data?: {
    datasource?: Record<string, unknown>;
    contextItem?: Record<string, unknown>;
  };
}

/**
 * Authoring / GraphQL names first; then standard SXA Promo template API names.
 * Note: Sitecore’s display names “Text 2” / “Text 3” are usually persisted as **PromoText2** / **PromoText3**
 * (see template field `Source` / API name), not `text2` / `text3`.
 */
const NO_IMAGE_TAG_FIELD_KEYS = ['text', 'Text'] as const;
const NO_IMAGE_HEADLINE_FIELD_KEYS = [
  'text 2',
  'Text 2',
  'text2',
  'Text2',
  'text_2',
  'Text_2',
  'PromoText2',
] as const;
/** Primary SXA rich-text: category chip when short, else main body (see `resolveNoImageCompressedTextSlots`). */
const NO_IMAGE_PROMO_TEXT_MAIN_KEYS = ['PromoText'] as const;
/** Plain-text length cap (after stripping tags) — above this, `PromoText` is treated as body, not pill. */
const NO_IMAGE_PROMO_TEXT_AS_PILL_MAX_PLAIN_CHARS = 28;
/** Secondary body: authoring “text 3” and template field PromoText3 only (not PromoText — that is picked separately). */
const NO_IMAGE_EXTENDED_BODY_FIELD_KEYS = [
  'text 3',
  'Text 3',
  'text3',
  'Text3',
  'text_3',
  'Text_3',
  'PromoText3',
] as const;
const NO_IMAGE_LINK_FIELD_KEYS = ['link', 'Link', 'PromoLink'] as const;

/** Normalize Sitecore / GraphQL field keys so `Text 2`, `text-2`, `TEXT__2` all match `text2`. */
function canonicalFieldKey(key: string): string {
  return key.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Merge top-level fields with `data.datasource` / `data.contextItem` (Headless layout nesting). */
function getMergedFieldRecord(fields: Fields): Record<string, unknown> {
  const top = fields as unknown as Record<string, unknown>;
  const nested: Record<string, unknown> = {};
  const data = top.data;
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const ds = d.datasource;
    const ctx = d.contextItem;
    if (ds && typeof ds === 'object') Object.assign(nested, ds as Record<string, unknown>);
    if (ctx && typeof ctx === 'object') Object.assign(nested, ctx as Record<string, unknown>);
  }
  return { ...top, ...nested };
}

function stripHtmlToPlainOneLine(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Plain string from Sitecore text field (Edge often puts HTML in `jsonValue.editable` while `value` is empty). */
function getTextFieldString(raw: unknown): string | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;

  const pickNonEmpty = (s: unknown): string | undefined =>
    typeof s === 'string' && s.trim() !== '' ? s : undefined;

  const htmlStringMayHaveText = (s: string): boolean =>
    stripHtmlToPlainOneLine(s).length > 0;

  const tryNestedValue = (val: unknown, allowHtmlEmptyStructure?: boolean): string | undefined => {
    if (typeof val === 'string') {
      if (pickNonEmpty(val)) return val;
      if (allowHtmlEmptyStructure && /<[a-z][\s\S]*>/i.test(val) && htmlStringMayHaveText(val)) return val;
      return undefined;
    }
    if (!val || typeof val !== 'object') return undefined;
    const obj = val as Record<string, unknown>;
    return (
      pickNonEmpty(obj.html) ??
      pickNonEmpty(obj.text) ??
      pickNonEmpty(obj.value as string | undefined) ??
      undefined
    );
  };

  const directEditable = pickNonEmpty(o.editable);
  if (directEditable) return directEditable;

  let val: unknown = o.value;
  const jvRaw = o.jsonValue;
  if (typeof jvRaw === 'string') {
    const jvStr = pickNonEmpty(jvRaw);
    if (jvStr) return jvStr;
  }
  if (jvRaw && typeof jvRaw === 'object') {
    const jv = jvRaw as Record<string, unknown>;
    const fromJvEditable = pickNonEmpty(jv.editable);
    if (fromJvEditable) return fromJvEditable;
    const fromJvRendered = pickNonEmpty(jv.rendered);
    if (fromJvRendered) return fromJvRendered;
    if (val === undefined) val = jv.value;
    if (typeof jv.value === 'string' && /<[a-z][\s\S]*>/i.test(jv.value) && htmlStringMayHaveText(jv.value)) {
      return jv.value;
    }
  }

  const fromVal = tryNestedValue(val, true);
  if (fromVal !== undefined) return fromVal;

  if (typeof o.value === 'string' && /<[a-z][\s\S]*>/i.test(o.value) && htmlStringMayHaveText(o.value)) {
    return o.value;
  }

  return undefined;
}

/**
 * True when the API sent a real Sitecore field payload (not only an empty local `value: ''` with no `jsonValue`).
 * Used to fall back to picking a field so Content SDK / Edge can render standard values and richer shapes.
 */
function isTextFieldBound(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  if (typeof o.editable === 'string' && o.editable.trim() !== '') return true;
  const jvRaw = o.jsonValue;
  if (jvRaw !== undefined && jvRaw !== null) {
    if (typeof jvRaw === 'string') return jvRaw.trim() !== '';
    if (typeof jvRaw === 'object' && Object.keys(jvRaw as object).length > 0) return true;
  }
  if (!('value' in o)) return false;
  const v = o.value;
  if (typeof v === 'string') return v.trim() !== '';
  if (v !== null && v !== undefined && typeof v === 'object') {
    return Object.keys(v as object).length > 0;
  }
  return false;
}

function isTagFieldKey(key: string): boolean {
  return canonicalFieldKey(key) === 'text';
}

function isHeadlineFieldKey(key: string): boolean {
  const c = canonicalFieldKey(key);
  return c === 'text2' || c === 'promotext2';
}

function isPromoTextMainFieldKey(key: string): boolean {
  return canonicalFieldKey(key) === 'promotext';
}

/** “Text 3” / PromoText3 only — PromoText is handled via {@link NO_IMAGE_PROMO_TEXT_MAIN_KEYS}. */
function isExtendedBodyFieldKey(key: string): boolean {
  const c = canonicalFieldKey(key);
  return c === 'text3' || c === 'promotext3';
}

function isLinkFieldKey(key: string): boolean {
  return canonicalFieldKey(key) === 'link';
}

/**
 * Try ordered explicit keys first, then scan all field keys (Edge / GraphQL names vary).
 */
function pickTextFieldSmart(
  fields: Fields,
  orderedKeys: readonly string[],
  keyMatcher: (key: string) => boolean,
): Field<string> | undefined {
  const fromOrdered = pickTextField(fields, orderedKeys);
  if (fromOrdered) return fromOrdered;

  const record = getMergedFieldRecord(fields);
  for (const key of Object.keys(record)) {
    if (!keyMatcher(key)) continue;
    const candidate = record[key];
    if (hasTextContent(candidate)) {
      return candidate as Field<string>;
    }
  }
  for (const key of Object.keys(record)) {
    if (!keyMatcher(key)) continue;
    const candidate = record[key];
    if (isTextFieldBound(candidate)) {
      return candidate as Field<string>;
    }
  }
  return undefined;
}

function isLinkFieldBound(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  const jvRaw = o.jsonValue;
  if (jvRaw !== undefined && jvRaw !== null) {
    if (typeof jvRaw === 'object' && Object.keys(jvRaw as object).length > 0) return true;
  }
  const top = o.value;
  if (top && typeof top === 'object') {
    const lo = top as Record<string, unknown>;
    if (typeof lo.href === 'string' && lo.href.trim() !== '') return true;
    if (typeof lo.url === 'string' && lo.url.trim() !== '') return true;
    if (typeof lo.text === 'string' && lo.text.trim() !== '') return true;
  }
  return false;
}

function pickLinkFieldSmart(
  fields: Fields,
  orderedKeys: readonly string[],
  keyMatcher: (key: string) => boolean,
): LinkField | undefined {
  const fromOrdered = pickLinkField(fields, orderedKeys);
  if (fromOrdered) return fromOrdered;

  const record = getMergedFieldRecord(fields);
  for (const key of Object.keys(record)) {
    if (!keyMatcher(key)) continue;
    const candidate = record[key];
    if (hasLinkContent(candidate)) {
      return candidate as LinkField;
    }
  }
  for (const key of Object.keys(record)) {
    if (!keyMatcher(key)) continue;
    const candidate = record[key];
    if (isLinkFieldBound(candidate)) {
      return candidate as LinkField;
    }
  }
  return undefined;
}

function hasTextContent(raw: unknown): boolean {
  return Boolean(getTextFieldString(raw)?.trim());
}

function pickTextField(fields: Fields, keys: readonly string[]): Field<string> | undefined {
  const record = getMergedFieldRecord(fields);
  for (const key of keys) {
    const candidate = record[key];
    if (hasTextContent(candidate)) {
      return candidate as Field<string>;
    }
  }
  for (const key of keys) {
    const candidate = record[key];
    if (isTextFieldBound(candidate)) {
      return candidate as Field<string>;
    }
  }
  return undefined;
}

function hasLinkContent(raw: unknown): boolean {
  return Boolean(getLinkHrefString(raw)?.trim());
}

function getLinkHrefString(raw: unknown): string | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const tryHref = (v: unknown): string | undefined => {
    if (v && typeof v === 'object') {
      const linkObj = v as { href?: unknown; url?: unknown };
      if (typeof linkObj.href === 'string') return linkObj.href;
      if (typeof linkObj.url === 'string') return linkObj.url;
    }
    return undefined;
  };
  const direct = tryHref(o.value);
  if (direct !== undefined) return direct;
  if (o.jsonValue && typeof o.jsonValue === 'object') {
    return tryHref((o.jsonValue as Record<string, unknown>).value);
  }
  return undefined;
}

function pickLinkField(fields: Fields, keys: readonly string[]): LinkField | undefined {
  const record = getMergedFieldRecord(fields);
  for (const key of keys) {
    const candidate = record[key];
    if (hasLinkContent(candidate)) {
      return candidate as LinkField;
    }
  }
  for (const key of keys) {
    const candidate = record[key];
    if (isLinkFieldBound(candidate)) {
      return candidate as LinkField;
    }
  }
  return undefined;
}

function hasImageFieldContent(field: ImageField | undefined): boolean {
  if (!field || typeof field !== 'object') return false;
  const top = field.value;
  if (top && typeof top === 'object' && 'src' in top) {
    const src = (top as { src?: string }).src;
    if (typeof src === 'string' && src.trim() !== '') return true;
  }
  const jv = (field as { jsonValue?: { value?: { src?: string } } }).jsonValue;
  const jSrc = jv?.value?.src;
  return typeof jSrc === 'string' && jSrc.trim() !== '';
}

function fieldsHaveSameTextContent(a: Field<string>, b: Field<string>): boolean {
  const sa = getTextFieldString(a)?.trim();
  const sb = getTextFieldString(b)?.trim();
  return Boolean(sa && sb && sa === sb);
}

/**
 * When `text` / `Text` are empty, authors often put the category label in **PromoText** (SXA field 1).
 * If it’s short and not multi-block, render it in the pill; otherwise treat as body copy.
 */
function isLikelyNoImageCategoryPillField(field: Field<string>): boolean {
  const raw = getTextFieldString(field);
  if (!raw?.trim()) return false;
  const plainLen = stripHtmlToPlainOneLine(raw).length;
  if (plainLen === 0 || plainLen > NO_IMAGE_PROMO_TEXT_AS_PILL_MAX_PLAIN_CHARS) return false;
  const pBlocks = (raw.match(/<p\b/gi) ?? []).length;
  if (pBlocks > 1) return false;
  if (/<(ul|ol|li)\b/i.test(raw)) return false;
  return true;
}

function resolveNoImageCompressedTextSlots(fields: Fields): {
  tagField: Field<string> | undefined;
  promoTextMainField: Field<string> | undefined;
} {
  const tagFromText = pickTextFieldSmart(fields, NO_IMAGE_TAG_FIELD_KEYS, isTagFieldKey);
  const promoTextCandidate = pickTextFieldSmart(
    fields,
    NO_IMAGE_PROMO_TEXT_MAIN_KEYS,
    isPromoTextMainFieldKey,
  );

  if (tagFromText) {
    let promoMain: Field<string> | undefined = promoTextCandidate;
    if (promoTextCandidate && fieldsHaveSameTextContent(tagFromText, promoTextCandidate)) {
      promoMain = undefined;
    }
    return { tagField: tagFromText, promoTextMainField: promoMain };
  }

  const headlineField = pickTextFieldSmart(fields, NO_IMAGE_HEADLINE_FIELD_KEYS, isHeadlineFieldKey);
  const headlinePresent = Boolean(headlineField);
  if (
    promoTextCandidate &&
    isLikelyNoImageCategoryPillField(promoTextCandidate) &&
    headlinePresent
  ) {
    return { tagField: promoTextCandidate, promoTextMainField: undefined };
  }

  return { tagField: undefined, promoTextMainField: promoTextCandidate };
}

function fieldLooksLikeHtml(raw: Field<string>): boolean {
  const value = getTextFieldString(raw);
  if (!value) return false;
  return /<[a-z][\s\S]*>/i.test(value);
}

function PromoNoImageCompressedHeadline(props: { field: Field<string> }): JSX.Element {
  const { field } = props;
  if (fieldLooksLikeHtml(field)) {
    return (
      <div className="promo-no-image-headline promo-no-image-compressed__headline">
        <ContentSdkRichText
          field={field}
          className="promo-no-image-compressed__headline-richtext"
        />
      </div>
    );
  }

  return (
    <ContentSdkText
      tag="h2"
      field={field}
      className="promo-no-image-headline promo-no-image-compressed__headline-title featured-tile__headline"
    />
  );
}

function PromoFeaturedTileShell(props: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="linkedDiv featured-tile featured-tile--without-image featured-tile--without-image--light">
      {props.children}
    </div>
  );
}

/** Shared copy block for aba.com-style featured tiles (with or without right-hand media). */
function PromoFeaturedTileInnerContent(props: { fields: Fields }): JSX.Element {
  const { fields } = props;
  const { tagField, promoTextMainField } = resolveNoImageCompressedTextSlots(fields);
  const headlineField = pickTextFieldSmart(fields, NO_IMAGE_HEADLINE_FIELD_KEYS, isHeadlineFieldKey);
  const extendedBodyField = pickTextFieldSmart(
    fields,
    NO_IMAGE_EXTENDED_BODY_FIELD_KEYS,
    isExtendedBodyFieldKey,
  );
  const linkField = pickLinkFieldSmart(fields, NO_IMAGE_LINK_FIELD_KEYS, isLinkFieldKey);

  const showTag =
    Boolean(tagField) && (hasTextContent(tagField) || isTextFieldBound(tagField));
  const showHeadline =
    Boolean(headlineField) && (hasTextContent(headlineField) || isTextFieldBound(headlineField));
  const showPromoTextMain =
    Boolean(promoTextMainField) &&
    (hasTextContent(promoTextMainField) || isTextFieldBound(promoTextMainField));
  const showExtendedBody =
    Boolean(extendedBodyField) &&
    (hasTextContent(extendedBodyField) || isTextFieldBound(extendedBodyField)) &&
    !(promoTextMainField && fieldsHaveSameTextContent(promoTextMainField, extendedBodyField!));
  const showLink =
    Boolean(linkField) && (hasLinkContent(linkField) || isLinkFieldBound(linkField));

  return (
    <>
      {showTag ? (
        <div className="promo-no-image-pill tag tag--outline">
          <ContentSdkRichText
            field={tagField!}
            className="promo-no-image-compressed__tag-richtext"
          />
        </div>
      ) : null}
      {showHeadline ? <PromoNoImageCompressedHeadline field={headlineField!} /> : null}
      {showPromoTextMain ? (
        <div className="field-promotext featured-tile__body promo-no-image-compressed__body promo-no-image-compressed__body--promotext">
          <ContentSdkRichText
            field={promoTextMainField!}
            className="promo-no-image-compressed__body-richtext"
          />
        </div>
      ) : null}
      {showExtendedBody ? (
        <div className="field-promotext featured-tile__body promo-no-image-compressed__body promo-no-image-compressed__body--promotext3">
          <ContentSdkRichText
            field={extendedBodyField!}
            className="promo-no-image-compressed__body-richtext"
          />
        </div>
      ) : null}
      {showLink && linkField ? (
        <div className="field-promolink">
          <ContentSdkLink field={linkField} className="call-to-action" />
        </div>
      ) : null}
    </>
  );
}

type PromoProps = {
  params: { [key: string]: string };
  fields: Fields;
};

const PromoDefaultComponent = (props: PromoProps): JSX.Element => (
  <div className={`component promo ${props.params.styles}`}>
    <div className="component-content">
      <span className="is-empty-hint">Promo</span>
    </div>
  </div>
);

/**
 * Default SXA Promo — aba.com “featured tile” with **text left / image right** (`PromoIcon`).
 * Copy slots match {@link NoImageCompressed}; without a usable image, layout falls back to the same single-column tile.
 */
export const Default = (props: PromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  if (!props.fields) {
    return <PromoDefaultComponent {...props} />;
  }

  const { fields } = props;
  const showImageColumn = hasImageFieldContent(fields.PromoIcon);

  const tile = (
    <PromoFeaturedTileShell>
      <PromoFeaturedTileInnerContent fields={fields} />
    </PromoFeaturedTileShell>
  );

  return (
    <div
      className={cn(
        'component promo',
        showImageColumn ? 'promo--featured-tile-with-image' : 'promo--no-image-compressed',
        props.params.styles,
      )}
      data-promo-layout={showImageColumn ? 'featured-tile-with-image' : 'no-image-compressed'}
      id={id ? id : undefined}
    >
      <div className="component-content">
        {showImageColumn ? (
          <div className="promo-featured-tile__grid">
            <div className="promo-featured-tile__text">{tile}</div>
            <div className="promo-featured-tile__media field-promoicon">
              <ContentSdkImage field={fields.PromoIcon} className="promo-featured-tile__image" />
            </div>
          </div>
        ) : (
          tile
        )}
      </div>
    </div>
  );
};

export const WithText = (props: PromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  if (props.fields) {
    return (
      <div className={`component promo ${props.params.styles}`} id={id ? id : undefined}>
        <div className="component-content">
          <div className="field-promoicon">
            <ContentSdkImage field={props.fields.PromoIcon} />
          </div>
          <div className="promo-text">
            <div>
              <div className="field-promotext">
                <ContentSdkRichText className="promo-text" field={props.fields.PromoText} />
              </div>
            </div>
            <div className="field-promotext">
              <ContentSdkRichText className="promo-text" field={props.fields.PromoText2} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <PromoDefaultComponent {...props} />;
};

/**
 * Matches aba.com homepage “featured tile” promos without imagery (see `featured-tile--without-image--light`).
 * Headless variant item name: “No Image Compressed” → `NoImageCompressed`.
 *
 * Datasource fields (aba.com-style):
 * - **Pill**: `text` / `Text`, or **PromoText** when those are empty, PromoText is short (category label), and **a headline is present** (otherwise PromoText stays body).
 * - **Title**: **text 2** / **PromoText2**
 * - **Body**: **PromoText** (when not used as pill) + **text 3** / **PromoText3**
 * - **link** / **PromoLink**
 * `PromoIcon` is not rendered.
 */
export const NoImageCompressed = (props: PromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  if (!props.fields) {
    return <PromoDefaultComponent {...props} />;
  }

  const { fields } = props;

  return (
    <div
      className={cn('component promo promo--no-image-compressed', props.params.styles)}
      data-promo-layout="no-image-compressed"
      id={id ? id : undefined}
    >
      <div className="component-content">
        <PromoFeaturedTileShell>
          <PromoFeaturedTileInnerContent fields={fields} />
        </PromoFeaturedTileShell>
      </div>
    </div>
  );
};

export const noImageCompressed = NoImageCompressed;
