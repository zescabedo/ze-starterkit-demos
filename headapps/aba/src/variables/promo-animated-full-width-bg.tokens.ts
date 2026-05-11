/**
 * PromoAnimated — Full Width Background variant tokens.
 *
 * Values live in `src/assets/styles/globals.css` (`@theme`). This file is the
 * TypeScript mirror used for inline `style` references (template literals);
 * Tailwind utility classes in the component use the raw `--min-height-…` /
 * `--color-…` names so the class strings are statically analyzable.
 */
export const promoAnimatedFullWidthBgCssVars = {
  /** Min-height of the full-bleed section on default (mobile) container width. */
  minHeight: '--min-height-promo-animated-full-width-bg',
  /** Min-height of the full-bleed section at the `@md` container breakpoint. */
  minHeightMd: '--min-height-promo-animated-full-width-bg-md',
  /** Min-height of the full-bleed section at the `@lg` container breakpoint. */
  minHeightLg: '--min-height-promo-animated-full-width-bg-lg',
  /** Primary CTA — gold pill (background / text / hover). */
  primaryCtaBg: '--color-promo-animated-full-width-bg-primary-cta-bg',
  primaryCtaText: '--color-promo-animated-full-width-bg-primary-cta-text',
  primaryCtaBgHover: '--color-promo-animated-full-width-bg-primary-cta-bg-hover',
  primaryCtaTextHover: '--color-promo-animated-full-width-bg-primary-cta-text-hover',
  /** Secondary CTA — solid primary blue (background / text / hover). */
  secondaryCtaBg: '--color-promo-animated-full-width-bg-secondary-cta-bg',
  secondaryCtaText: '--color-promo-animated-full-width-bg-secondary-cta-text',
  secondaryCtaBgHover: '--color-promo-animated-full-width-bg-secondary-cta-bg-hover',
  secondaryCtaTextHover: '--color-promo-animated-full-width-bg-secondary-cta-text-hover',
  /** Title / description colors — default (white over bg image). */
  titleFg: '--color-promo-animated-full-width-bg-title-fg',
  descriptionFg: '--color-promo-animated-full-width-bg-description-fg',
  /** Title / description colors when the `container-dark-background` style is applied. */
  titleFgOnDarkBg: '--color-promo-animated-full-width-bg-title-fg-on-dark-bg',
  descriptionFgOnDarkBg: '--color-promo-animated-full-width-bg-description-fg-on-dark-bg',
} as const;

export const promoAnimatedFullWidthBgTokens = {
  cssVars: promoAnimatedFullWidthBgCssVars,
} as const;
