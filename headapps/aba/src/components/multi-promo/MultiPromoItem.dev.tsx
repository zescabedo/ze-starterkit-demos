import type { LinkField } from '@sitecore-content-sdk/nextjs';
import { Link, Text } from '@sitecore-content-sdk/nextjs';
import { MultiPromoItemProps } from '@/components/multi-promo/multi-promo.props';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';

const mapToItemProps = (fields: MultiPromoItemProps) => {
  return {
    eyebrow: fields?.eyebrow?.jsonValue,
    title: fields?.heading?.jsonValue,
    description: fields?.description?.jsonValue,
    image: fields?.image?.jsonValue,
    link: fields?.link?.jsonValue,
    isPageEditing: fields?.isPageEditing,
  };
};

export const Default: React.FC<MultiPromoItemProps> = (props) => {
  const itemProps = mapToItemProps(props || {});
  const { eyebrow: eyebrowField, title, description: descriptionField, image, link, isPageEditing } =
    itemProps || {};

  const showImage = isPageEditing || image?.value?.src;
  const showEyebrow = Boolean(eyebrowField && (isPageEditing || eyebrowField.value));
  const showTitle = Boolean(title && (isPageEditing || title.value));
  const showDescription = Boolean(
    descriptionField && (isPageEditing || descriptionField.value)
  );
  const hasNavigableLink = Boolean(link?.value?.href);

  const baseLink = (link || {}) as LinkField;

  /** Card body is the visible label; clear link text in normal mode so Sitecore does not append CTA copy. */
  const cardLink: LinkField =
    !isPageEditing && baseLink?.value
      ? { ...baseLink, value: { ...baseLink.value, text: '' } }
      : baseLink;

  const media = showImage ? (
    <div className="multi-promo-events__card-media">
      <ImageWrapper
        image={image}
        className="h-full w-full object-cover"
        wrapperClass="image-container h-full w-full"
        sizes="(max-width: 640px) 140px, 160px"
      />
    </div>
  ) : null;

  const textBlock = (
    <div className="multi-promo-events__card-body">
      {showEyebrow && eyebrowField && (
        <Text tag="p" field={eyebrowField} className="multi-promo-events__card-date" />
      )}
      {showTitle && title && (
        <Text tag="h3" field={title} className="multi-promo-events__card-title" />
      )}
      {showDescription && descriptionField && (
        <Text
          tag="p"
          field={descriptionField}
          className="multi-promo-events__card-description"
        />
      )}
    </div>
  );

  return (
    <article className="multi-promo-events__card">
      {hasNavigableLink || isPageEditing ? (
        <Link field={cardLink} className="multi-promo-events__card-hit-area">
          {media}
          {textBlock}
        </Link>
      ) : (
        <div className="multi-promo-events__card-hit-area">
          {media}
          {textBlock}
        </div>
      )}
    </article>
  );
};
