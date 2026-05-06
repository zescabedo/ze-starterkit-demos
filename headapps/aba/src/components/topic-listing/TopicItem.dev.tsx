import { Default as Icon } from '@/components/icon/Icon';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { getPlainTextFromSitecoreField } from '@/components/text-banner/text-banner-field-utils';
import { TopicItemProps } from './topic-listing.props';
import { resolveTopicLinkImageForWrapper, topicItemImageWrapperInput } from './topic-link-image';
import { IconName } from '@/enumerations/Icon.enum';
import { EnumValues } from '@/enumerations/generic.enum';
import { Link, Text, type Field, type LinkField } from '@sitecore-content-sdk/nextjs';
import type React from 'react';
import { cn } from '@/lib/utils';

const emptyLink: LinkField = { value: { href: '#', text: 'Add link' } };

function topicIconFromField(icon?: { jsonValue?: Field<string> }): EnumValues<typeof IconName> | null {
  const raw = icon?.jsonValue?.value;
  if (raw == null || typeof raw !== 'string') {
    return null;
  }
  const normalized = raw.trim().toLowerCase().replace(/\s+/g, '-');
  return Object.values(IconName).includes(normalized as EnumValues<typeof IconName>)
    ? (normalized as EnumValues<typeof IconName>)
    : null;
}

export const TopicItem: React.FC<TopicItemProps & Record<string, unknown>> = (props) => {
  const { icon, isPageEditing = false } = props;
  const link =
    props.link ?? (props.linkOptional as TopicItemProps['link'] | undefined);
  const description =
    props.description ?? (props.Description as TopicItemProps['description'] | undefined);
  const descriptionPlain = getPlainTextFromSitecoreField(description);
  const imageBlock = topicItemImageWrapperInput(props);
  const imageField = resolveTopicLinkImageForWrapper(imageBlock);
  const imageSrc =
    imageField?.value && typeof imageField.value === 'object'
      ? (imageField.value as { src?: string }).src
      : undefined;
  const hasImageSrc = typeof imageSrc === 'string' && imageSrc.length > 0;

  const iconName = topicIconFromField(icon);
  // Always show the image field in edit mode (with icon or not) so authors get Sitecore's image picker.
  const showImageSlot = hasImageSrc || isPageEditing;
  const showIconFallback = Boolean(iconName) && !hasImageSrc && !isPageEditing;
  const showMedia = showImageSlot || showIconFallback;

  if (!isPageEditing && !link?.jsonValue?.value?.href) {
    return null;
  }

  const effectiveLink = link?.jsonValue ?? emptyLink;

  return (
    <div
      className="flex max-w-sm flex-col items-center gap-4 text-center @md:max-w-none"
      data-class-change
      data-testid="topic-item"
    >
      {showMedia ? (
        <div
          className={cn(
            'flex min-h-[5rem] w-full flex-shrink-0 flex-col items-center justify-center gap-2',
            showIconFallback && 'text-primary-foreground'
          )}
        >
          {showImageSlot ? (
            <ImageWrapper
              image={imageField}
              className="mx-auto h-20 w-auto max-w-[140px] object-contain"
              wrapperClass="flex w-full justify-center"
            />
          ) : null}
          {showIconFallback && iconName ? (
            <Icon iconName={iconName} className="h-16 w-16 shrink-0" isAriaHidden={true} />
          ) : null}
        </div>
      ) : null}

      {(effectiveLink?.value?.text || isPageEditing) && (
        <Link
          field={effectiveLink}
          editable={isPageEditing}
          className={cn(
            'font-sans text-base font-bold leading-snug text-primary-foreground hover:text-primary-foreground/90 md:text-lg',
            !isPageEditing && 'no-underline hover:underline'
          )}
        />
      )}

      {(descriptionPlain || isPageEditing) && (
        <Text
          field={description?.jsonValue}
          tag="p"
          className="max-w-sm font-sans text-sm font-normal leading-relaxed text-primary-foreground md:text-base"
        />
      )}
    </div>
  );
};
