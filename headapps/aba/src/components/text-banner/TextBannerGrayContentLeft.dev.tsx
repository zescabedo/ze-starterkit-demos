import { TextBannerProps } from './text-banner.props';
import { cn } from '@/lib/utils';
import { Link, Text, type Field, type LinkField } from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { getDescriptiveLinkText } from '@/utils/link-text';
import {
  getPlainTextFromSitecoreField,
  mergeTextBannerFieldRecord,
  normalizeLinkFieldForRendering,
  pickCategoryRawField,
} from './text-banner-field-utils';

const linkIsValid = (link: LinkField | undefined) => {
  if (!link?.value) return false;
  const v = link.value;
  const hrefOk = typeof v.href === 'string' && v.href !== '' && v.href !== 'http://';
  const urlOk = typeof v.url === 'string' && v.url !== '';
  const textOk = typeof v.text === 'string' && v.text.trim() !== '';
  return textOk && (hrefOk || urlOk);
};

function isProbablyLinkField(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  if (o.jsonValue !== undefined && o.jsonValue !== null) return true;
  const v = o.value;
  if (v && typeof v === 'object') {
    return 'href' in v || 'url' in v || 'linktype' in v;
  }
  return false;
}

const topicTagClassName = cn(
  'topic-tag inline-block border-2 border-[#111] bg-transparent',
  'px-[15px] py-[5px] text-center text-sm font-black leading-[19px] tracking-[1px]',
  'rounded-2xl text-[#333] no-underline transition-all duration-200 ease-in-out',
  'mb-2.5 hover:bg-[#ECB84C] hover:no-underline',
);

export const Default: React.FC<TextBannerProps> = (props) => {
  const { fields, page } = props;
  const isPageEditing = page?.mode?.isEditing ?? false;

  if (!fields) {
    return <NoDataFallback componentName="Text Banner: Gray Content Left" />;
  }

  const merged = mergeTextBannerFieldRecord(fields as unknown as Record<string, unknown>);
  const heading = merged.heading as Field<string> | undefined;
  const description = merged.description as Field<string> | undefined;
  const headingContext =
    typeof heading === 'object' && heading !== null && 'value' in heading
      ? (heading as { value?: string }).value
      : undefined;

  const renderCategorySlot = (slot: 1 | 2 | 3) => {
    const raw = pickCategoryRawField(merged, slot);
    if (raw == null) return null;

    const normalizedLink = normalizeLinkFieldForRendering(raw);
    const linkField: LinkField | undefined =
      normalizedLink ?? (isPageEditing && isProbablyLinkField(raw) ? (raw as LinkField) : undefined);

    if (linkField && (isPageEditing || linkIsValid(linkField))) {
      const field =
        !isPageEditing && linkField.value?.text
          ? {
              ...linkField,
              value: {
                ...linkField.value,
                text: getDescriptiveLinkText(linkField, headingContext),
              },
            }
          : linkField;
      return (
        <span className="rich-text inline">
          <Link field={field} editable={isPageEditing} className={topicTagClassName} />
        </span>
      );
    }

    const plain = getPlainTextFromSitecoreField(raw);
    if (plain) {
      if (isPageEditing) {
        return (
          <span className="rich-text inline">
            <Text tag="span" field={raw as Field<string>} className={topicTagClassName} />
          </span>
        );
      }
      return (
        <span className="rich-text inline">
          <span className={topicTagClassName}>{plain}</span>
        </span>
      );
    }

    if (isPageEditing && isProbablyLinkField(raw)) {
      return (
        <span className="rich-text inline">
          <Link field={raw as LinkField} editable={true} className={topicTagClassName} />
        </span>
      );
    }

    return null;
  };

  return (
    <section
      className={cn(
        'featured-tiles m-0 w-full bg-[var(--color-aba-text-banner-gray-band)] py-[15px]',
        props?.params?.styles,
      )}
    >
      <div className="mx-auto w-full max-w-screen-xl px-4 xl:px-8">
        <div className="flex flex-wrap items-center gap-x-[11px] gap-y-2 lg:gap-x-[31px]">
          {heading ? (
            <span className="rich-text inline max-md:w-full">
              <Text
                tag="span"
                field={heading as Field<string>}
                className={cn(
                  'quick-links__headline',
                  'font-[family-name:var(--font-family-body)]',
                  'text-base font-bold uppercase leading-[19px] tracking-[1px] text-[#111]',
                )}
              />
            </span>
          ) : null}
          {isPageEditing && description && (
            <span className="rich-text inline max-md:w-full">
              <Text tag="span" field={description} className="text-sm text-[#333]" />
            </span>
          )}
          {renderCategorySlot(1)}
          {renderCategorySlot(2)}
          {renderCategorySlot(3)}
        </div>
      </div>
    </section>
  );
};
