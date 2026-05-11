'use client';

import { useEffect, useState } from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';
import {
  Text,
  RichText,
  Image as ContentSdkImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ButtonBase as Button } from '@/components/button-component/ButtonComponent';
import { ButtonVariants } from '@/enumerations/ButtonStyle.enum';
import { Default as AnimatedSection } from '@/components/animated-section/AnimatedSection.dev';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { PromoAnimatedProps } from './promo-animated.props';

/**
 * Title color: default token over the bg image, swapped to the on-dark-bg token whenever
 * the SXA "Dark background" style (`container-dark-background`) is merged onto the content
 * wrapper (the same element that carries the `group` class).
 */
const titleColorStyles =
  'text-[var(--color-promo-animated-full-width-bg-title-fg)] group-[.container-dark-background]:text-[var(--color-promo-animated-full-width-bg-title-fg-on-dark-bg)]';

/**
 * Description color: same approach as title, but also overrides the prose color vars so
 * `<RichText>` internals (paragraphs, headings, bold, links) follow suit on dark bg.
 */
const descriptionColorStyles =
  'text-[var(--color-promo-animated-full-width-bg-description-fg)] group-[.container-dark-background]:text-[var(--color-promo-animated-full-width-bg-description-fg-on-dark-bg)] group-[.container-dark-background]:[--tw-prose-body:var(--color-promo-animated-full-width-bg-description-fg-on-dark-bg)] group-[.container-dark-background]:[--tw-prose-headings:var(--color-promo-animated-full-width-bg-description-fg-on-dark-bg)] group-[.container-dark-background]:[--tw-prose-bold:var(--color-promo-animated-full-width-bg-description-fg-on-dark-bg)] group-[.container-dark-background]:[--tw-prose-links:var(--color-promo-animated-full-width-bg-description-fg-on-dark-bg)]';

/**
 * Sitecore `Link` often wraps the real `<a>`; Radix `Slot` may merge button classes onto that wrapper,
 * leaving the anchor unstyled (matches the same workaround used by the ABA Promo variant).
 * Target `a` explicitly with `!important` so the variant-specific CTA color tokens win.
 *
 * Static class strings are required so Tailwind can statically extract the arbitrary-value
 * utilities (`bg-[var(--token)]`, `text-[var(--token)]`, etc.) at build time.
 */
const primaryCtaAnchorStyles =
  '[&_a]:!inline-flex [&_a]:!items-center [&_a]:!justify-center [&_a]:!gap-2 [&_a]:!whitespace-nowrap [&_a]:!rounded-full [&_a]:!border-0 [&_a]:!shadow-none [&_a]:!px-8 [&_a]:!py-2.5 [&_a]:!text-sm [&_a]:!font-bold [&_a]:!transition-colors [&_a]:!no-underline [&_a]:!bg-[var(--color-promo-animated-full-width-bg-primary-cta-bg)] [&_a]:!text-[var(--color-promo-animated-full-width-bg-primary-cta-text)] [&_a:hover]:!bg-[var(--color-promo-animated-full-width-bg-primary-cta-bg-hover)] [&_a:hover]:!text-[var(--color-promo-animated-full-width-bg-primary-cta-text-hover)] [&_a:focus-visible]:!outline-none [&_a:focus-visible]:!ring-2 [&_a:focus-visible]:!ring-ring [&_a:focus-visible]:!ring-offset-2 [&_a]:!ring-offset-background';

const secondaryCtaAnchorStyles =
  '[&_a]:!inline-flex [&_a]:!items-center [&_a]:!justify-center [&_a]:!gap-2 [&_a]:!whitespace-nowrap [&_a]:!rounded-full [&_a]:!border-0 [&_a]:!shadow-none [&_a]:!px-8 [&_a]:!py-2.5 [&_a]:!text-sm [&_a]:!font-bold [&_a]:!transition-colors [&_a]:!no-underline [&_a]:!bg-[var(--color-promo-animated-full-width-bg-secondary-cta-bg)] [&_a]:!text-[var(--color-promo-animated-full-width-bg-secondary-cta-text)] [&_a:hover]:!bg-[var(--color-promo-animated-full-width-bg-secondary-cta-bg-hover)] [&_a:hover]:!text-[var(--color-promo-animated-full-width-bg-secondary-cta-text-hover)] [&_a:focus-visible]:!outline-none [&_a:focus-visible]:!ring-2 [&_a:focus-visible]:!ring-ring [&_a:focus-visible]:!ring-offset-2 [&_a]:!ring-offset-background';

/**
 * Same Default layout (two-column grid: image column + content column with title /
 * description / CTAs) but the datasource `image` is rendered as a full-bleed background
 * spanning the entire section. Replaces the colored bg-extension + circular image
 * treatment used by the Default variant.
 *
 * The bg image is rendered with `next/image` `fill` directly (rather than via
 * `ImageWrapper`) so that we do not pass conflicting `width`/`height` alongside `fill`;
 * editing/preview falls back to the editable Sitecore `Image` component at natural size.
 */
export const PromoAnimatedFullWidthBackground: React.FC<PromoAnimatedProps> = (props) => {
  const { fields, isPageEditing } = props;
  const { page } = useSitecore();
  const isEditableMode = page.mode.isEditing || page.mode.isPreview;
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  if (fields) {
    const { image, title, description, primaryLink, secondaryLink } = fields;
    const hasLinks = isPageEditing || primaryLink?.value?.href || secondaryLink?.value?.href;
    const imageSrc = (image?.value?.src as string | undefined) ?? '';
    const imageAlt = (image?.value?.alt as string | undefined) ?? '';

    return (
      <section data-component="PromoAnimated" className="@container">
        <div
          className={cn(
            'promo-animated--full-width-bg relative isolate flex items-center overflow-hidden',
            'left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw]',
            'min-h-[var(--min-height-promo-animated-full-width-bg)]',
            '@md:min-h-[var(--min-height-promo-animated-full-width-bg-md)]',
            '@lg:min-h-[var(--min-height-promo-animated-full-width-bg-lg)]'
          )}
        >
          <div className="promo-animated--full-width-bg__image pointer-events-none absolute inset-0 z-0">
            {image && (
              isEditableMode || !imageSrc ? (
                <ContentSdkImage
                  field={image}
                  className="h-full w-full object-cover object-center"
                  editable={page.mode.isEditing}
                />
              ) : (
                <NextImage
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover object-center"
                />
              )
            )}
          </div>

          <div
            data-class-change
            className={cn(
              'promo-animated__content-wrapper promo-animated--full-width-bg__content-wrapper @md:grid-cols-2 @md:items-center @md:gap-10 @xl:gap-[135px] group relative z-[2] mx-auto grid w-full max-w-7xl grid-cols-1 px-4 py-16 @md:py-24 @lg:py-32',
              { [props?.params?.styles]: props?.params?.styles }
            )}
          >
            {/*
             * Content first → lands in grid col 1 (left) on `@md+`, matching the ABA Promo
             * variant's content-left / decorative-right layout. The empty `__image` slot keeps
             * the two-column grid intact so the existing `data-class-change` styles still apply.
             */}
            <div className="promo-animated__content @md:order-1 @md:flex @md:max-w-xl @md:flex-col @md:justify-center @md:items-start min-w-0">
              {title && (
                <AnimatedSection reducedMotion={prefersReducedMotion} isPageEditing={isPageEditing}>
                  <Text
                    tag="h2"
                    className={cn(
                      'font-heading @sm:text-5xl @lg:text-6xl -ml-1 mt-6 max-w-[15.5ch] text-4xl font-normal leading-[1.1333] tracking-tighter group-[.position-center]:mx-auto group-[.position-right]:ml-auto',
                      titleColorStyles
                    )}
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
                    className={cn(
                      'prose prose-invert mt-6 max-w-[51.5ch] text-lg tracking-tight group-[.position-center]:mx-auto group-[.position-right]:ml-auto',
                      descriptionColorStyles
                    )}
                    field={description}
                  />
                </AnimatedSection>
              )}

              {hasLinks && (
                <AnimatedSection
                  delay={600}
                  className="@md:mb-0 mb-6 mt-10 flex w-full flex-wrap gap-2 group-[.position-right]:justify-end group-[.position-center]:justify-center"
                  reducedMotion={prefersReducedMotion}
                  isPageEditing={isPageEditing}
                >
                  {primaryLink && (
                    <div className={primaryCtaAnchorStyles} data-testid="primary-cta">
                      <Button
                        buttonLink={primaryLink}
                        isPageEditing={isPageEditing}
                        contextTitle={title?.value}
                        variant={ButtonVariants.PRIMARY}
                        className="rounded-full border-0 shadow-none"
                      />
                    </div>
                  )}
                  {secondaryLink && (
                    <div className={secondaryCtaAnchorStyles} data-testid="secondary-cta">
                      <Button
                        buttonLink={secondaryLink}
                        isPageEditing={isPageEditing}
                        contextTitle={title?.value}
                        variant={ButtonVariants.PRIMARY}
                        className="rounded-full border-0 shadow-none"
                      />
                    </div>
                  )}
                </AnimatedSection>
              )}
            </div>

            <div
              aria-hidden
              className="promo-animated__image @md:order-2 @md:block hidden w-full"
            />
          </div>
        </div>
      </section>
    );
  }

  return <NoDataFallback componentName="Promo Animated: Full Width Background" />;
};
