import type { ComponentParams, Field } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

/** Known rendering parameters (also accepts other Sitecore layout param keys). */
export type PricingDetailsParams = ComponentParams & {
  backgroundTheme?: string;
  BackgroundTheme?: string;
  hideTitle?: string;
  HideTitle?: string;
  hideCredits?: string;
  HideCredits?: string;
  hideFootnote?: string;
  HideFootnote?: string;
  hideSavings?: string;
  HideSavings?: string;
  contentIsFree?: string;
  ContentIsFree?: string;
};

export interface PricingDetailsFields {
  data?: {
    datasource?: {
      productTypeTitle?: { jsonValue?: Field<string> };
      memberPriceLabel?: { jsonValue?: Field<string> };
      nonMemberPriceLabel?: { jsonValue?: Field<string> };
      savingsIntro?: { jsonValue?: Field<string> };
      creditCost?: { jsonValue?: Field<number> };
      footnote?: { jsonValue?: Field<string> };
    };
  };
}

export interface PricingDetailsProps extends ComponentProps {
  params: PricingDetailsParams;
  fields: PricingDetailsFields;
}
