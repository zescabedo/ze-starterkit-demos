import componentMap from '.sitecore/component-map.client';
import { applyPromoAnimatedVariantAliases } from '@/lib/apply-promo-animated-variant-aliases';
import { applyPromoVariantAliases } from '@/lib/apply-promo-variant-aliases';
import { applyTextBannerVariantAliases } from '@/lib/apply-text-banner-variant-aliases';

applyPromoAnimatedVariantAliases(componentMap);
applyPromoVariantAliases(componentMap);
applyTextBannerVariantAliases(componentMap);

export default componentMap;
