import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

export interface TopicListingParams {
  backgroundTheme: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface TopicListingFields {
  data: {
    datasource: {
      title: { jsonValue: Field<string> };
      /** Sitecore template field `Button` (single-line text), exposed as `button` after GraphQL alias. */
      button?: {
        jsonValue?: Field<string>;
      };
      children?: {
        results: TopicItemProps[];
      };
    };
  };
}

export interface TopicListingProps extends ComponentProps {
  params: TopicListingParams;
  fields: TopicListingFields;
}

export type TopicItemProps = {
  link?: {
    jsonValue?: LinkField;
  };
  icon?: {
    jsonValue?: Field<string>;
  };
  image?: {
    jsonValue?: ImageField;
  };
  description?: {
    jsonValue?: Field<string>;
  };
  isPageEditing?: boolean;
};
