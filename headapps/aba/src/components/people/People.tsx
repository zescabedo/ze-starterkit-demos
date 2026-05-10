import type { JSX, ReactNode } from 'react';
import {
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text as ContentSdkText,
} from '@sitecore-content-sdk/nextjs';
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import {
  canonicalFieldKey,
  normalizeLinkFieldForRendering,
} from '@/components/text-banner/text-banner-field-utils';
import type { PeopleFieldsInput, PeopleProps } from './people.props';
import { peopleRenderingStyleClasses, resolvePeopleImageOrientation } from './people-params';

function getMergedPeopleRecord(fields: PeopleFieldsInput | undefined): Record<string, unknown> {
  if (!fields) return {};
  const top = fields as Record<string, unknown>;
  const nested: Record<string, unknown> = {};
  const data = top.data;
  if (data && typeof data === 'object') {
    const d = data as {
      datasource?: Record<string, unknown>;
      contextItem?: Record<string, unknown>;
    };
    if (d.datasource && typeof d.datasource === 'object') {
      Object.assign(nested, d.datasource);
    }
    if (d.contextItem && typeof d.contextItem === 'object') {
      Object.assign(nested, d.contextItem);
    }
  }
  return { ...top, ...nested };
}

function unwrapTextField(raw: unknown): Field<string> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  if ('jsonValue' in o && o.jsonValue !== undefined && o.jsonValue !== null) {
    return o.jsonValue as Field<string>;
  }
  return raw as Field<string>;
}

function unwrapImageField(raw: unknown): ImageField | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  if ('jsonValue' in o && o.jsonValue !== undefined && o.jsonValue !== null) {
    return o.jsonValue as ImageField;
  }
  return raw as ImageField;
}

function unwrapLinkField(raw: unknown): LinkField | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  if ('jsonValue' in o && o.jsonValue !== undefined && o.jsonValue !== null) {
    return o.jsonValue as LinkField;
  }
  return raw as LinkField;
}

/** Same as Promo: Edge often uses `url` or nests href only under `jsonValue.value` (see {@link normalizeLinkFieldForRendering}). */
function getPeopleLinkHrefString(raw: unknown): string | undefined {
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

function hasPeopleLinkContent(raw: unknown): boolean {
  return Boolean(getPeopleLinkHrefString(raw)?.trim());
}

function pickPeopleLinkRaw(record: Record<string, unknown>): unknown {
  const ordered = ['Link', 'link'] as const;
  for (const key of ordered) {
    const c = record[key];
    if (c != null) return c;
  }
  for (const key of Object.keys(record)) {
    if (canonicalFieldKey(key) !== 'link') continue;
    const c = record[key];
    if (c != null) return c;
  }
  return undefined;
}

/**
 * Resolves a Content SDK–friendly {@link LinkField}: normalizes `jsonValue.value` into `value`
 * when the layout service leaves top-level `value` empty.
 */
function resolvePeopleLinkField(record: Record<string, unknown>): LinkField | undefined {
  const raw = pickPeopleLinkRaw(record);
  if (raw == null) return undefined;
  const normalized = normalizeLinkFieldForRendering(raw);
  const forSdk = (normalized as LinkField | undefined) ?? unwrapLinkField(raw) ?? (raw as LinkField);
  if (!hasPeopleLinkContent(forSdk) && !hasPeopleLinkContent(raw)) {
    return undefined;
  }
  return (normalized as LinkField | undefined) ?? forSdk;
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

function hasTextFieldContent(field: Field<string> | undefined): boolean {
  if (!field || typeof field !== 'object') return false;
  const v = (field as { value?: unknown }).value;
  if (typeof v === 'string' && v.trim() !== '') return true;
  const jv = (field as { jsonValue?: { value?: unknown } }).jsonValue;
  const jvVal = jv && typeof jv === 'object' ? (jv as { value?: unknown }).value : undefined;
  return typeof jvVal === 'string' && jvVal.trim() !== '';
}

function fieldPlainString(field: Field<string> | undefined): string {
  if (!field || typeof field !== 'object') return '';
  const top = (field as { value?: unknown }).value;
  if (typeof top === 'string' && top.trim() !== '') return top.trim();
  const jv = (field as { jsonValue?: { value?: unknown } }).jsonValue;
  const jvVal = jv && typeof jv === 'object' ? (jv as { value?: unknown }).value : undefined;
  return typeof jvVal === 'string' && jvVal.trim() !== '' ? jvVal.trim() : '';
}

function formatLocation(record: Record<string, unknown>): string {
  const parts = [
    fieldPlainString(unwrapTextField(record.City)),
    fieldPlainString(unwrapTextField(record.State)),
    fieldPlainString(unwrapTextField(record.Country)),
  ].filter(Boolean);
  return parts.join(', ');
}

function PeopleMetaLine(props: {
  label: string;
  field: Field<string> | undefined;
  className?: string;
}): JSX.Element | null {
  const { label, field, className } = props;
  if (!field || !hasTextFieldContent(field)) return null;
  return (
    <div className={cn('people-card__meta-row', className)}>
      <dt className="people-card__meta-label">{label}</dt>
      <dd className="people-card__meta-value">
        <ContentSdkText tag="span" field={field} />
      </dd>
    </div>
  );
}

function PeopleCardBody(props: { record: Record<string, unknown> }): JSX.Element {
  const { record } = props;
  const first = unwrapTextField(record.FirstName);
  const last = unwrapTextField(record.LastName);
  const job = unwrapTextField(record.JobTitle);
  const dept = unwrapTextField(record.Department);
  const company = unwrapTextField(record.Company);
  const location = formatLocation(record);
  const description = unwrapTextField(record.Description) ?? unwrapTextField(record.description);
  const linkField = resolvePeopleLinkField(record);

  const showName = Boolean(first && hasTextFieldContent(first)) || Boolean(last && hasTextFieldContent(last));
  const showDept = Boolean(dept && hasTextFieldContent(dept));
  const showGoldAccent = showDept || showName;

  return (
    <div className="people-card__inner">
      {showDept ? (
        <div className="people-card__pill promo-no-image-pill tag tag--outline">
          <ContentSdkText tag="span" field={dept!} className="people-card__pill-text" />
        </div>
      ) : null}
      {showGoldAccent ? <div className="people-card__gold-bar" aria-hidden /> : null}
      {showName ? (
        <h2 className="people-card__name">
          {first && hasTextFieldContent(first) ? (
            <ContentSdkText tag="span" field={first} className="people-card__name-part" />
          ) : null}
          {first && hasTextFieldContent(first) && last && hasTextFieldContent(last) ? (
            <span className="people-card__name-space"> </span>
          ) : null}
          {last && hasTextFieldContent(last) ? (
            <ContentSdkText tag="span" field={last} className="people-card__name-part" />
          ) : null}
        </h2>
      ) : null}
      {job && hasTextFieldContent(job) ? (
        <p className="people-card__job">
          <ContentSdkText tag="span" field={job} />
        </p>
      ) : null}
      <dl className="people-card__meta">
        <PeopleMetaLine label="Company" field={company ?? undefined} />
        {location ? (
          <div className="people-card__meta-row">
            <dt className="people-card__meta-label">Location</dt>
            <dd className="people-card__meta-value">{location}</dd>
          </div>
        ) : (
          <>
            <PeopleMetaLine label="City" field={unwrapTextField(record.City)} />
            <PeopleMetaLine label="State" field={unwrapTextField(record.State)} />
            <PeopleMetaLine label="Country" field={unwrapTextField(record.Country)} />
          </>
        )}
      </dl>
      {description && hasTextFieldContent(description) ? (
        <div
          className={cn(
            'field-peopledescription',
            'featured-tile__body',
            'promo-no-image-compressed__body',
            'promo-no-image-compressed__body--promotext3',
            'people-card__description',
          )}
        >
          <ContentSdkRichText
            field={description}
            className="promo-no-image-compressed__body-richtext"
          />
        </div>
      ) : null}
      {linkField ? (
        <div className="field-peoplelink people-card__link-wrap">
          <ContentSdkLink field={linkField} className="call-to-action" />
        </div>
      ) : null}
    </div>
  );
}

function PeopleShell(props: {
  children: ReactNode;
  layout: 'with-image' | 'no-image';
  params: PeopleProps['params'];
}): JSX.Element {
  const { children, layout, params } = props;
  const id = params.RenderingIdentifier;
  const styleClasses = peopleRenderingStyleClasses(params);
  const imageLeft =
    layout === 'with-image' && resolvePeopleImageOrientation(params) === 'image-left';

  return (
    <div
      className={cn(
        'component people',
        layout === 'with-image' ? 'people--with-image' : 'people--no-image',
        imageLeft && 'people--image-left',
        styleClasses,
      )}
      data-people-layout={layout}
      id={id}
    >
      <div className="component-content people__content">
        <div
          className={cn(
            'linkedDiv featured-tile featured-tile--without-image featured-tile--without-image--light people-card',
            layout === 'with-image' && 'people-card--split',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function PeopleLayout(props: {
  record: Record<string, unknown>;
  headshot: ImageField | undefined;
  forceHideImage?: boolean;
  params: PeopleProps['params'];
}): JSX.Element {
  const { record, headshot, forceHideImage, params } = props;
  const showImageColumn = !forceHideImage && hasImageFieldContent(headshot);

  if (showImageColumn) {
    const imageLeft = resolvePeopleImageOrientation(params) === 'image-left';
    const textColumn = (
      <div className="people-card__text" key="people-text">
        <PeopleCardBody record={record} />
      </div>
    );
    const mediaColumn = (
      <div className="people-card__media" key="people-media">
        <ContentSdkImage field={headshot!} className="people-card__image" />
      </div>
    );

    return (
      <PeopleShell layout="with-image" params={params}>
        <div className="people-card__grid">
          {imageLeft ? (
            <>
              {mediaColumn}
              {textColumn}
            </>
          ) : (
            <>
              {textColumn}
              {mediaColumn}
            </>
          )}
        </div>
      </PeopleShell>
    );
  }

  return (
    <PeopleShell layout="no-image" params={params}>
      <PeopleCardBody record={record} />
    </PeopleShell>
  );
}

function resolvePeopleProps(props: PeopleProps): {
  record: Record<string, unknown>;
  headshot: ImageField | undefined;
} | null {
  if (!props.fields) return null;
  const record = getMergedPeopleRecord(props.fields);
  const headshot = unwrapImageField(record.HeadshotImage);
  return { record, headshot };
}

export const Default = (props: PeopleProps): JSX.Element => {
  const resolved = resolvePeopleProps(props);
  if (!resolved) {
    return <NoDataFallback componentName="People" />;
  }
  return (
    <PeopleLayout
      record={resolved.record}
      headshot={resolved.headshot}
      forceHideImage={false}
      params={props.params}
    />
  );
};

/**
 * Headless variant **No Image** — never renders headshot, even when `HeadshotImage` is set.
 * Sitecore item: `/sitecore/content/article-sites/aba/Presentation/Headless Variants/People/No Image`
 */
export const NoImage = (props: PeopleProps): JSX.Element => {
  const resolved = resolvePeopleProps(props);
  if (!resolved) {
    return <NoDataFallback componentName="People" />;
  }
  return (
    <PeopleLayout
      record={resolved.record}
      headshot={resolved.headshot}
      forceHideImage
      params={props.params}
    />
  );
};

export const noImage = NoImage;
