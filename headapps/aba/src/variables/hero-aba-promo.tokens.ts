import type { StaticImageData } from 'next/image';
import homepageTextureAsset from '@/assets/images/aba-homepage-gradient-texture.png';

/**
 * ABA.com homepage hero left column (`.col-lg-6.texture-bg` + `::before`), May 2026:
 * - Base: `background-image: url(/-/media/images/150/HomepageGradient1.png); background-size: cover;`
 * - Overlay: `linear-gradient(345deg, #0b3052, #1967a6, #0b3052); opacity: 0.97;`
 *
 * Texture file is a local copy of Sitecore `HomepageGradient1.png` for the PromoAnimated ABA Promo variant.
 */
const homepageTextureSrc =
  typeof homepageTextureAsset === 'string'
    ? homepageTextureAsset
    : (homepageTextureAsset as StaticImageData).src;

/** CSS custom property names — values live in `src/assets/styles/globals.css` (`@theme`). */
export const heroAbaPromoCssVars = {
  gradientAngle: '--hero-aba-gradient-angle',
  gradientStopMid: '--hero-aba-gradient-stop-mid',
  gradientOverlayOpacity: '--hero-aba-gradient-overlay-opacity',
  surfaceDeep: '--color-hero-aba-surface-deep',
  surface: '--color-hero-aba-surface',
  surfaceMid: '--color-hero-aba-surface-mid',
  gradientEdge: '--color-hero-aba-gradient-edge',
  gradientCenter: '--color-hero-aba-gradient-center',
  gradientEnd: '--color-hero-aba-gradient-end',
  primaryCtaBackground: '--color-hero-aba-primary-cta-bg',
  primaryCtaText: '--color-hero-aba-primary-cta-text',
} as const;

export const heroAbaPromoTokens = {
  /** Bundled `HomepageGradient1.png` — base layer under the gradient overlay */
  homepageTextureSrc,
  cssVars: heroAbaPromoCssVars,
} as const;
