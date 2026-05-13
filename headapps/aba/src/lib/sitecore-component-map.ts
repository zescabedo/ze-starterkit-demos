import componentMap from '.sitecore/component-map';
import { applyPeopleVariantAliases } from '@/lib/apply-people-variant-aliases';
import { applyPromoAnimatedVariantAliases } from '@/lib/apply-promo-animated-variant-aliases';
import { applyPromoVariantAliases } from '@/lib/apply-promo-variant-aliases';
import { applyTextBannerVariantAliases } from '@/lib/apply-text-banner-variant-aliases';
import { applyTopicListingVariantAliases } from '@/lib/apply-topic-listing-variant-aliases';

applyPromoAnimatedVariantAliases(componentMap);
applyTopicListingVariantAliases(componentMap);
applyPromoVariantAliases(componentMap);
applyTextBannerVariantAliases(componentMap);
applyPeopleVariantAliases(componentMap);

export default componentMap;
