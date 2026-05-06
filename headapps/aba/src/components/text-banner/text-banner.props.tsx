import { Field, LinkField, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { EnumValues } from '@/enumerations/generic.enum';
import { Theme } from '@/enumerations/Theme.enum';

/**
 * Model used for Sitecore Component integration
 */
export type TextBannerProps = ComponentProps & TextBannerFields & TextBannerParams;

export type TextBannerFields = {
  fields: {
    heading: Field<string>; // Sitecore editable text field
    description?: Field<string>; // Sitecore editable text field
    link?: LinkField; // Sitecore editable link field
    link2?: LinkField; // Sitecore editable link field
    /** General Link fields for Gray Content Left / category-style pill bands */
    Category1?: LinkField;
    Category2?: LinkField;
    Category3?: LinkField;
    image?: ImageField; // Sitecore editable image field
    /** Headless layout: datasource fields may be nested here (same as Promo / Title) */
    data?: {
      datasource?: Record<string, unknown>;
      contextItem?: Record<string, unknown>;
    };
  };
  isPageEditing?: boolean;
};

export type TextBannerParams = {
  params?: {
    excludeTopMargin?: string;
    theme?: EnumValues<typeof Theme>;
  };
};
