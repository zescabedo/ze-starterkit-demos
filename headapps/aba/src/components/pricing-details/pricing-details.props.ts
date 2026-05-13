import type { Field } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export type PricingDetailsParams = Record<string, string>;

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
