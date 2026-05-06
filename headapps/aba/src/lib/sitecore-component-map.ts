import componentMap from '.sitecore/component-map';
import { applyPromoAnimatedVariantAliases } from '@/lib/apply-promo-animated-variant-aliases';
import { applyPromoVariantAliases } from '@/lib/apply-promo-variant-aliases';

applyPromoAnimatedVariantAliases(componentMap);
applyPromoVariantAliases(componentMap);

export default componentMap;
