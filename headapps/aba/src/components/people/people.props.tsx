import type { ComponentProps } from '@/lib/component-props';
import type { ComponentParams, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

export type PeopleTextField = Field<string> | { jsonValue?: Field<string> };

export type PeopleLinkField = LinkField | { jsonValue?: LinkField };

export type PeopleDatasourceFields = {
  FirstName?: PeopleTextField;
  LastName?: PeopleTextField;
  HeadshotImage?: ImageField | { jsonValue?: ImageField };
  JobTitle?: PeopleTextField;
  Department?: PeopleTextField;
  Company?: PeopleTextField;
  City?: PeopleTextField;
  State?: PeopleTextField;
  Country?: PeopleTextField;
  /** Multi-line text (`People/Professional/Description` → API name `Description`). */
  Description?: PeopleTextField;
  description?: PeopleTextField;
  /** General Link field on template (`People/Link` → API name `Link`). */
  Link?: PeopleLinkField;
  link?: PeopleLinkField;
};

export type PeopleFieldsInput = PeopleDatasourceFields & {
  data?: {
    datasource?: PeopleDatasourceFields & Record<string, unknown>;
  };
} & Record<string, unknown>;

export interface PeopleProps extends ComponentProps {
  params: ComponentParams;
  fields: PeopleFieldsInput;
}
