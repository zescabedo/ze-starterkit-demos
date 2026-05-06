'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Text, RichText } from '@sitecore-content-sdk/nextjs';
import { ButtonBase as Button } from '@/components/button-component/ButtonComponent';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { Default as AnimatedSection } from '@/components/animated-section/AnimatedSection.dev';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { PromoAnimatedProps } from './promo-animated.props';
import { ButtonVariants } from '@/enumerations/ButtonStyle.enum';
import { heroAbaPromoTokens } from '@/variables/hero-aba-promo.tokens';

const { homepageTextureSrc, cssVars: aba } = heroAbaPromoTokens;

/**
 * Sitecore `Link` often wraps the real `<a>`; Radix `Slot` may merge button classes onto that wrapper,
 * leaving the anchor unstyled (ghost link). Target `a` explicitly — matches aba.com solid gold pill CTA.
 * Use static class strings so Tailwind sees full arbitrary values (avoid dynamic `var(${...})`-only builds).
 */
const abaPromoPrimaryCtaAnchorStyles =
  '[&_a]:!inline-flex [&_a]:!items-center [&_a]:!justify-center [&_a]:!gap-2 [&_a]:!whitespace-nowrap [&_a]:!rounded-full [&_a]:!border-0 [&_a]:!shadow-none [&_a]:!px-8 [&_a]:!py-2.5 [&_a]:!text-sm [&_a]:!font-bold [&_a]:!transition-colors [&_a]:!no-underline [&_a]:!bg-[var(--color-classic-gold)] [&_a]:!text-[var(--color-accent-foreground)] [&_a:hover]:!bg-primary-hover [&_a:hover]:!text-primary-foreground [&_a:focus-visible]:!outline-none [&_a:focus-visible]:!ring-2 [&_a:focus-visible]:!ring-ring [&_a:focus-visible]:!ring-offset-2 [&_a]:!ring-offset-background';

export const PromoAnimatedABAPromo: React.FC<PromoAnimatedProps> = (props) => {
  const { fields, isPageEditing } = props;
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  if (fields) {
    const { image, title, description, primaryLink, secondaryLink } = fields;
    const hasLinks = isPageEditing || primaryLink?.value?.href || secondaryLink?.value?.href;

    return (
      <section data-component="PromoAnimated" className="@container">
        <div
          className="promo-animated--aba-promo__band relative isolate left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${homepageTextureSrc})`,
          }}
        >
          {/* Same stack as aba.com: linear-gradient overlay on top of HomepageGradient1 texture */}
          <div
            aria-hidden
            className="promo-animated--aba-promo__gradient-overlay pointer-events-none absolute inset-0 z-[1]"
            style={{
              backgroundImage: `linear-gradient(
              var(${aba.gradientAngle}),
              var(${aba.surfaceDeep}) 0%,
              var(${aba.surface}) var(${aba.gradientStopMid}),
              var(${aba.surfaceMid}) 100%
            )`,
              opacity: `var(${aba.gradientOverlayOpacity})`,
            }}
          />
          <div
            data-class-change
            className={cn(
              'promo-animated__content-wrapper promo-animated--aba-promo relative z-[2] mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 @md:grid-cols-2 @md:gap-12 @md:px-8 @md:py-16 @lg:gap-16 @lg:py-20',
              { [props.params?.styles as string]: props.params?.styles }
            )}
          >
            <div className="promo-animated__content @md:order-1 @md:flex @md:max-w-xl @md:flex-col @md:justify-center min-w-0 order-2">
              {title && (
                <AnimatedSection reducedMotion={prefersReducedMotion} isPageEditing={isPageEditing}>
                  <Text
                    tag="h1"
                    className="font-heading text-[var(--color-hero-aba-text)] @lg:text-6xl max-w-[20ch] text-4xl font-normal leading-[1.12] tracking-tight @md:text-5xl"
                    field={title}
                  />
                </AnimatedSection>
              )}

              {description && (
                <AnimatedSection
                  delay={300}
                  reducedMotion={prefersReducedMotion}
                  isPageEditing={isPageEditing}
                >
                  <RichText
                    className="prose prose-lg mt-5 max-w-[52ch] leading-snug text-[var(--color-hero-aba-description)] prose-p:mb-3 prose-p:mt-0 prose-a:text-[var(--color-hero-aba-text)] prose-a:underline prose-strong:text-[var(--color-hero-aba-text)] @md:mt-6"
                    field={description}
                  />
                </AnimatedSection>
              )}

              {hasLinks && (
                <AnimatedSection
                  delay={600}
                  className="mt-8 flex w-full flex-wrap gap-3 @md:mt-10 @lg:gap-4"
                  reducedMotion={prefersReducedMotion}
                  isPageEditing={isPageEditing}
                >
                  {primaryLink && (
                    <div className={abaPromoPrimaryCtaAnchorStyles}>
                      <Button
                        buttonLink={primaryLink}
                        isPageEditing={isPageEditing}
                        contextTitle={title?.value}
                        variant={ButtonVariants.PRIMARY}
                        className={cn(
                          'rounded-full border-0 shadow-none',
                          `bg-[var(${aba.primaryCtaBackground})] text-[var(${aba.primaryCtaText})]`,
                          'hover:bg-primary-hover hover:text-primary-foreground'
                        )}
                      />
                    </div>
                  )}
                  {secondaryLink && (
                    <Button
                      variant={ButtonVariants.OUTLINE}
                      buttonLink={secondaryLink}
                      isPageEditing={isPageEditing}
                      contextTitle={title?.value}
                      className="rounded-full border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
                    />
                  )}
                </AnimatedSection>
              )}
            </div>

            <div className="promo-animated__image @md:order-2 @md:flex @md:justify-end order-1 w-full">
              {image && (
                <AnimatedSection
                  delay={150}
                  direction="right"
                  reducedMotion={prefersReducedMotion}
                  isPageEditing={isPageEditing}
                  className="w-full @md:max-w-lg @lg:max-w-xl"
                >
                  <ImageWrapper
                    image={image}
                    className="aspect-[4/3] w-full rounded-lg object-cover shadow-2xl ring-1 ring-white/10 @md:aspect-[5/4]"
                    wrapperClass="relative w-full overflow-hidden rounded-lg"
                    sizes="(min-width: 1024px) 36rem, (min-width: 768px) 28rem, 100vw"
                    priority={true}
                  />
                </AnimatedSection>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <NoDataFallback componentName="Promo Animated: ABA Promo" />;
};
