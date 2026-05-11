import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Default as PromoAnimated,
  ImageRight,
  ABAPromo,
  abaPromo,
  FullWidthBackground,
  fullWidthBackground,
} from '@/components/promo-animated/PromoAnimated';
import type { PromoAnimatedProps } from '@/components/promo-animated/promo-animated.props';
import type { ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import {
  defaultProps,
  propsEditing,
  propsPrimaryColorScheme,
  propsSecondaryColorScheme,
  propsWithoutDescription,
  propsWithoutLinks,
  propsWithoutPrimaryLink,
  propsWithoutSecondaryLink,
  propsWithCustomStyles,
  propsWithPositionRight,
  propsWithCleanBackgroundStyle,
  propsWithDarkBackgroundStyle,
  propsWithoutFields,
} from './PromoAnimated.mockProps';

// Type definitions for mock components
interface MockTextProps {
  field?: { value?: string };
  tag?: string;
  className?: string;
}

interface MockRichTextProps {
  field?: { value?: string };
  className?: string;
}

interface MockImageWrapperProps {
  image?: ImageField;
  className?: string;
  wrapperClass?: string;
}

interface MockAnimatedSectionProps {
  children?: React.ReactNode;
  className?: string;
  animationType?: string;
}

interface MockButtonBaseProps {
  buttonLink?: LinkField;
  variant?: string;
  isPageEditing?: boolean;
}

interface MockNoDataFallbackProps {
  componentName?: string;
}

// Mock dependencies
jest.mock('@/lib/utils', () => ({
  cn: (...args: Array<string | boolean | Record<string, boolean> | undefined>) => {
    return args
      .flat(2)
      .filter(Boolean)
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object' && !Array.isArray(arg)) {
          return Object.entries(arg)
            .filter(([, value]) => Boolean(value))
            .map(([key]) => key)
            .join(' ');
        }
        return '';
      })
      .filter(Boolean)
      .join(' ')
      .trim();
  },
}));

interface MockSitecoreImageProps {
  field?: ImageField;
  className?: string;
}

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Text: ({ field, tag, className }: MockTextProps) => {
    const Tag = tag || 'span';
    return React.createElement(Tag, { className }, field?.value || '');
  },
  RichText: ({ field, className }: MockRichTextProps) =>
    React.createElement('div', {
      className,
      dangerouslySetInnerHTML: { __html: field?.value || '' },
    }),
  Image: ({ field, className }: MockSitecoreImageProps) =>
    React.createElement('img', {
      'data-testid': 'sitecore-image',
      src: field?.value?.src as string | undefined,
      alt: (field?.value?.alt as string | undefined) ?? '',
      className,
    }),
  useSitecore: () => ({
    page: {
      mode: {
        isEditing: false,
        isPreview: false,
      },
    },
  }),
}));

jest.mock('next/image', () => {
  const MockNextImage = ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
  }) =>
    React.createElement('img', {
      'data-testid': 'next-image',
      src,
      alt,
      className,
    });
  MockNextImage.displayName = 'MockNextImage';
  return { __esModule: true, default: MockNextImage };
});

jest.mock('@/components/image/ImageWrapper.dev', () => ({
  Default: ({ image, className, wrapperClass }: MockImageWrapperProps) => (
    <div data-testid="image-wrapper" className={wrapperClass}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image?.value?.src as string | undefined}
        alt={image?.value?.alt as string | undefined}
        className={className}
      />
    </div>
  ),
}));

jest.mock('@/components/animated-section/AnimatedSection.dev', () => ({
  Default: ({ children, className, animationType }: MockAnimatedSectionProps) => (
    <div data-testid="animated-section" data-animation-type={animationType} className={className}>
      {children}
    </div>
  ),
}));

jest.mock('@/components/button-component/ButtonComponent', () => ({
  ButtonBase: ({ buttonLink, variant, isPageEditing }: MockButtonBaseProps) => {
    if (!buttonLink?.value?.href && !isPageEditing) return null;
    return (
      <a
        data-testid="button-component"
        data-variant={variant || 'default'}
        href={buttonLink?.value?.href as string | undefined}
      >
        {buttonLink?.value?.text}
      </a>
    );
  },
}));

jest.mock('@/utils/NoDataFallback', () => ({
  NoDataFallback: ({ componentName }: MockNoDataFallbackProps) => (
    <div data-testid="no-data-fallback">{componentName}</div>
  ),
}));

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('PromoAnimated Component - Default Variant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render with all fields', () => {
      render(<PromoAnimated {...defaultProps} />);

      expect(screen.getByText('Discover Excellence')).toBeInTheDocument();
      expect(screen.getByTestId('image-wrapper')).toBeInTheDocument();
      expect(screen.getByText('Shop Now')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
    });

    it('should render as section with data-component attribute', () => {
      const { container } = render(<PromoAnimated {...defaultProps} />);

      const section = container.querySelector('section[data-component="PromoAnimated"]');
      expect(section).toBeInTheDocument();
    });

    it('should render title in h2 tag', () => {
      const { container } = render(<PromoAnimated {...defaultProps} />);

      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Discover Excellence');
    });

    it('should render description as RichText', () => {
      const { container } = render(<PromoAnimated {...defaultProps} />);

      expect(container.textContent).toContain(
        'Experience the finest quality with our exclusive collection'
      );
    });

    it('should render image with proper alt text', () => {
      const { container } = render(<PromoAnimated {...defaultProps} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('src', '/images/promo-animated.jpg');
      expect(img).toHaveAttribute('alt', 'Promo Animated Image');
    });

    it('should render both primary and secondary links', () => {
      render(<PromoAnimated {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-component');
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveAttribute('href', '/shop/premium');
      expect(buttons[1]).toHaveAttribute('href', '/learn-more');
    });
  });

  describe('Component structure', () => {
    it('should apply container class', () => {
      const { container } = render(<PromoAnimated {...defaultProps} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('@container');
    });

    it('should apply grid layout classes', () => {
      const { container } = render(<PromoAnimated {...defaultProps} />);

      const contentWrapper = container.querySelector('.promo-animated__content-wrapper');
      expect(contentWrapper).toHaveClass('grid', 'grid-cols-1');
    });

    it('should render animated sections', () => {
      render(<PromoAnimated {...defaultProps} />);

      const animatedSections = screen.getAllByTestId('animated-section');
      expect(animatedSections.length).toBeGreaterThan(0);
    });

    it('should render rotate animation for sprite', () => {
      render(<PromoAnimated {...defaultProps} />);

      const animatedSections = screen.getAllByTestId('animated-section');
      const rotateSection = animatedSections.find(
        (section) => section.getAttribute('data-animation-type') === 'rotate'
      );
      expect(rotateSection).toBeInTheDocument();
    });
  });

  describe('Color schemes', () => {
    it('should apply default color scheme', () => {
      const { container } = render(<PromoAnimated {...defaultProps} />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should apply primary color scheme', () => {
      const { container } = render(<PromoAnimated {...propsPrimaryColorScheme} />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should apply secondary color scheme', () => {
      const { container } = render(<PromoAnimated {...propsSecondaryColorScheme} />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Custom styles and positioning', () => {
    it('should apply custom styles from params', () => {
      const { container } = render(<PromoAnimated {...propsWithCustomStyles} />);

      const contentWrapper = container.querySelector('.promo-animated__content-wrapper');
      expect(contentWrapper).toHaveClass('position-center');
    });

    it('should apply position-right class', () => {
      const { container } = render(<PromoAnimated {...propsWithPositionRight} />);

      const contentWrapper = container.querySelector('.promo-animated__content-wrapper');
      expect(contentWrapper).toHaveClass('position-right');
    });
  });

  describe('Optional fields', () => {
    it('should render without description', () => {
      render(<PromoAnimated {...propsWithoutDescription} />);

      expect(screen.getByText('Discover Excellence')).toBeInTheDocument();
      expect(screen.getByTestId('image-wrapper')).toBeInTheDocument();
      expect(screen.getByText('Shop Now')).toBeInTheDocument();
    });

    it('should render without links in non-editing mode', () => {
      render(<PromoAnimated {...propsWithoutLinks} />);

      expect(screen.getByText('Discover Excellence')).toBeInTheDocument();
      expect(screen.queryByTestId('button-component')).not.toBeInTheDocument();
    });

    it('should render without primary link', () => {
      render(<PromoAnimated {...propsWithoutPrimaryLink} />);

      const buttons = screen.getAllByTestId('button-component');
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveAttribute('href', '/learn-more');
    });

    it('should render without secondary link', () => {
      render(<PromoAnimated {...propsWithoutSecondaryLink} />);

      const buttons = screen.getAllByTestId('button-component');
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveAttribute('href', '/shop/premium');
    });
  });

  describe('Editing mode', () => {
    it('should render links in editing mode even without href', () => {
      const propsEditingNoLinks = {
        ...propsEditing,
        fields: {
          ...propsEditing.fields,
          primaryLink: { value: {} } as unknown as LinkField,
          secondaryLink: { value: {} } as unknown as LinkField,
        },
      };

      render(<PromoAnimated {...propsEditingNoLinks} />);

      expect(screen.getByText('Discover Excellence')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should render NoDataFallback when fields is null', () => {
      render(<PromoAnimated {...propsWithoutFields} />);

      const fallback = screen.getByTestId('no-data-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveTextContent('Promo Animated');
    });

    it('should render NoDataFallback when fields is undefined', () => {
      const propsWithUndefinedFields = {
        ...defaultProps,
        fields: undefined as unknown as PromoAnimatedProps['fields'],
      };

      render(<PromoAnimated {...propsWithUndefinedFields} />);

      const fallback = screen.getByTestId('no-data-fallback');
      expect(fallback).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render image with alt text', () => {
      const { container } = render(<PromoAnimated {...defaultProps} />);

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Promo Animated Image');
    });

    it('should render links with proper href', () => {
      render(<PromoAnimated {...defaultProps} />);

      const buttons = screen.getAllByTestId('button-component');
      expect(buttons[0]).toHaveAttribute('href', '/shop/premium');
      expect(buttons[1]).toHaveAttribute('href', '/learn-more');
    });

    it('should render heading with semantic h2 tag', () => {
      const { container } = render(<PromoAnimated {...defaultProps} />);

      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
    });
  });
});

describe('PromoAnimated Component - ImageRight Variant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render with all fields', () => {
      render(<ImageRight {...defaultProps} />);

      expect(screen.getByText('Discover Excellence')).toBeInTheDocument();
      expect(screen.getByTestId('image-wrapper')).toBeInTheDocument();
      expect(screen.getByText('Shop Now')).toBeInTheDocument();
    });

    it('should render as section with data-component attribute', () => {
      const { container } = render(<ImageRight {...defaultProps} />);

      const section = container.querySelector('section[data-component="PromoAnimated"]');
      expect(section).toBeInTheDocument();
    });

    it('should apply order-2 class to image container', () => {
      const { container } = render(<ImageRight {...defaultProps} />);

      const imageContainer = container.querySelector('.promo-animated__image');
      expect(imageContainer).toHaveClass('@md:order-2');
    });

    it('should apply order-1 class to content container', () => {
      const { container } = render(<ImageRight {...defaultProps} />);

      const contentContainer = container.querySelector('.promo-animated__content');
      expect(contentContainer).toHaveClass('@md:order-1');
    });
  });

  describe('Edge cases', () => {
    it('should render NoDataFallback when fields is null', () => {
      render(<ImageRight {...propsWithoutFields} />);

      const fallback = screen.getByTestId('no-data-fallback');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveTextContent('Promo Animated: Image Right');
    });
  });

  describe('Variant comparison', () => {
    it('should render same content as Default variant but with different order', () => {
      const { container: defaultContainer } = render(<PromoAnimated {...defaultProps} />);
      const { container: imageRightContainer } = render(<ImageRight {...defaultProps} />);

      // Both should have the same text content
      expect(defaultContainer.textContent).toContain('Discover Excellence');
      expect(imageRightContainer.textContent).toContain('Discover Excellence');

      // But different layout classes
      const defaultImageContainer = defaultContainer.querySelector('.promo-animated__image');
      const imageRightImageContainer = imageRightContainer.querySelector(
        '.promo-animated__image'
      );

      expect(defaultImageContainer).not.toHaveClass('@md:order-2');
      expect(imageRightImageContainer).toHaveClass('@md:order-2');
    });
  });
});

describe('PromoAnimated Component - ABAPromo / abaPromo Variant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with headline as h1', () => {
    const { container } = render(<ABAPromo {...defaultProps} />);
    const heading = container.querySelector('h1');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Discover Excellence');
  });

  it('should render full-bleed layout class on inner wrapper', () => {
    const { container } = render(<ABAPromo {...defaultProps} />);
    const bleed = container.querySelector('[class*="max-w-[100vw]"]');
    expect(bleed).toBeInTheDocument();
  });

  it('should render section with data-component and ABA promo grid class', () => {
    const { container } = render(<ABAPromo {...defaultProps} />);
    const section = container.querySelector('section[data-component="PromoAnimated"]');
    expect(section).toBeInTheDocument();
    const wrapper = container.querySelector('.promo-animated--aba-promo');
    expect(wrapper).toBeInTheDocument();
  });

  it('should alias abaPromo to the same variant', () => {
    const AbaPromoExport = abaPromo;
    const { container: a } = render(<ABAPromo {...defaultProps} />);
    const { container: b } = render(<AbaPromoExport {...defaultProps} />);
    expect(a.querySelector('h1')).toHaveTextContent('Discover Excellence');
    expect(b.querySelector('h1')).toHaveTextContent('Discover Excellence');
  });

  it('should render NoDataFallback when fields is null', () => {
    render(<ABAPromo {...propsWithoutFields} />);
    expect(screen.getByTestId('no-data-fallback')).toHaveTextContent('Promo Animated: ABA Promo');
  });
});

describe('PromoAnimated Component - FullWidthBackground Variant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the title as an h2 (same as Default)', () => {
    const { container } = render(<FullWidthBackground {...defaultProps} />);
    const heading = container.querySelector('h2');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Discover Excellence');
  });

  it('should render description and CTAs', () => {
    render(<FullWidthBackground {...defaultProps} />);
    expect(screen.getByText('Shop Now')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('should render the datasource image as a full-bleed background', () => {
    const { container } = render(<FullWidthBackground {...defaultProps} />);

    const fullBleed = container.querySelector('.promo-animated--full-width-bg');
    expect(fullBleed).toBeInTheDocument();
    expect(fullBleed).toHaveClass('w-screen', 'max-w-[100vw]');

    const bgImage = container.querySelector('.promo-animated--full-width-bg__image');
    expect(bgImage).toBeInTheDocument();
    expect(bgImage).toHaveClass('absolute', 'inset-0');

    // Production (non-editing) path renders next/image with `fill`, no width/height.
    const img = bgImage?.querySelector('img');
    expect(img).toHaveAttribute('data-testid', 'next-image');
    expect(img).toHaveAttribute('src', '/images/promo-animated.jpg');
    expect(img).toHaveAttribute('alt', 'Promo Animated Image');
    expect(img).toHaveClass('object-cover', 'object-center');
  });

  it('should apply min-height tokens so the bg covers the entire section', () => {
    const { container } = render(<FullWidthBackground {...defaultProps} />);
    const fullBleed = container.querySelector('.promo-animated--full-width-bg');

    expect(fullBleed).toHaveClass(
      'min-h-[var(--min-height-promo-animated-full-width-bg)]',
      '@md:min-h-[var(--min-height-promo-animated-full-width-bg-md)]',
      '@lg:min-h-[var(--min-height-promo-animated-full-width-bg-lg)]'
    );
  });

  it('should vertically center its content within the full-bleed area', () => {
    const { container } = render(<FullWidthBackground {...defaultProps} />);
    const fullBleed = container.querySelector('.promo-animated--full-width-bg');
    expect(fullBleed).toHaveClass('flex', 'items-center');
  });

  it('should place content in the left grid column (ABA Promo–style order)', () => {
    const { container } = render(<FullWidthBackground {...defaultProps} />);

    const content = container.querySelector('.promo-animated__content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('@md:order-1');

    const decorativeSlot = container.querySelector('.promo-animated__image');
    expect(decorativeSlot).toBeInTheDocument();
    expect(decorativeSlot).toHaveClass('@md:order-2');
  });

  it('should render the primary CTA wrapper with the gold-token anchor styles', () => {
    const { getByTestId } = render(<FullWidthBackground {...defaultProps} />);

    const primary = getByTestId('primary-cta');
    expect(primary).toHaveClass(
      '[&_a]:!bg-[var(--color-promo-animated-full-width-bg-primary-cta-bg)]',
      '[&_a]:!text-[var(--color-promo-animated-full-width-bg-primary-cta-text)]',
      '[&_a:hover]:!bg-[var(--color-promo-animated-full-width-bg-primary-cta-bg-hover)]',
      '[&_a:hover]:!text-[var(--color-promo-animated-full-width-bg-primary-cta-text-hover)]'
    );
    const link = primary.querySelector('[data-testid="button-component"]');
    expect(link).toHaveAttribute('href', '/shop/premium');
  });

  it('should render the secondary CTA wrapper with the primary-blue-token anchor styles', () => {
    const { getByTestId } = render(<FullWidthBackground {...defaultProps} />);

    const secondary = getByTestId('secondary-cta');
    expect(secondary).toHaveClass(
      '[&_a]:!bg-[var(--color-promo-animated-full-width-bg-secondary-cta-bg)]',
      '[&_a]:!text-[var(--color-promo-animated-full-width-bg-secondary-cta-text)]',
      '[&_a:hover]:!bg-[var(--color-promo-animated-full-width-bg-secondary-cta-bg-hover)]',
      '[&_a:hover]:!text-[var(--color-promo-animated-full-width-bg-secondary-cta-text-hover)]'
    );
    const link = secondary.querySelector('[data-testid="button-component"]');
    expect(link).toHaveAttribute('href', '/learn-more');
  });

  it('should render both CTAs with the solid primary (`default`) button variant', () => {
    const { getByTestId } = render(<FullWidthBackground {...defaultProps} />);

    expect(
      getByTestId('primary-cta').querySelector('[data-testid="button-component"]')
    ).toHaveAttribute('data-variant', 'default');
    expect(
      getByTestId('secondary-cta').querySelector('[data-testid="button-component"]')
    ).toHaveAttribute('data-variant', 'default');
  });

  it('should not render any readability overlay (gradient removed)', () => {
    const { container } = render(<FullWidthBackground {...defaultProps} />);
    expect(container.querySelector('.promo-animated--full-width-bg__overlay')).toBeNull();
  });

  it('should keep the same two-column content wrapper layout as Default', () => {
    const { container } = render(<FullWidthBackground {...defaultProps} />);
    const wrapper = container.querySelector('.promo-animated__content-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('grid', 'grid-cols-1', '@md:grid-cols-2');
  });

  it('should apply custom styles from params', () => {
    const { container } = render(<FullWidthBackground {...propsWithCustomStyles} />);
    const wrapper = container.querySelector('.promo-animated__content-wrapper');
    expect(wrapper).toHaveClass('position-center');
  });

  it('should render title/description with the default (clean) text color tokens', () => {
    const { container } = render(<FullWidthBackground {...defaultProps} />);

    const title = container.querySelector('h2');
    expect(title).toHaveClass(
      'text-[var(--color-promo-animated-full-width-bg-title-fg)]',
      'group-[.container-dark-background]:text-[var(--color-promo-animated-full-width-bg-title-fg-on-dark-bg)]'
    );
    expect(title).not.toHaveClass('text-white');

    const description = container.querySelector('.prose');
    expect(description).toHaveClass(
      'text-[var(--color-promo-animated-full-width-bg-description-fg)]',
      'group-[.container-dark-background]:text-[var(--color-promo-animated-full-width-bg-description-fg-on-dark-bg)]'
    );
    expect(description).not.toHaveClass('text-white/90');
  });

  it('should also override RichText prose color vars on dark background', () => {
    const { container } = render(<FullWidthBackground {...defaultProps} />);
    const description = container.querySelector('.prose');
    expect(description).toHaveClass(
      'group-[.container-dark-background]:[--tw-prose-body:var(--color-promo-animated-full-width-bg-description-fg-on-dark-bg)]',
      'group-[.container-dark-background]:[--tw-prose-headings:var(--color-promo-animated-full-width-bg-description-fg-on-dark-bg)]',
      'group-[.container-dark-background]:[--tw-prose-bold:var(--color-promo-animated-full-width-bg-description-fg-on-dark-bg)]',
      'group-[.container-dark-background]:[--tw-prose-links:var(--color-promo-animated-full-width-bg-description-fg-on-dark-bg)]'
    );
  });

  it('should pass the "container-clean-background" style through to the group wrapper without changing the static color classes', () => {
    const { container } = render(<FullWidthBackground {...propsWithCleanBackgroundStyle} />);
    const wrapper = container.querySelector('.promo-animated__content-wrapper');
    expect(wrapper).toHaveClass('group', 'container-clean-background');

    // Static color tokens stay on title/description; the clean-background style is the
    // "default" state, so no override classes activate.
    const title = container.querySelector('h2');
    expect(title).toHaveClass(
      'text-[var(--color-promo-animated-full-width-bg-title-fg)]'
    );
  });

  it('should pass the "container-dark-background" style through to the group wrapper so the override classes activate', () => {
    const { container } = render(<FullWidthBackground {...propsWithDarkBackgroundStyle} />);
    const wrapper = container.querySelector('.promo-animated__content-wrapper');
    expect(wrapper).toHaveClass('group', 'container-dark-background');

    // Title/description carry both default + group-[.container-dark-background] override
    // classes; on the rendered DOM the override variant gets matched by CSS at runtime.
    const title = container.querySelector('h2');
    expect(title).toHaveClass(
      'text-[var(--color-promo-animated-full-width-bg-title-fg)]',
      'group-[.container-dark-background]:text-[var(--color-promo-animated-full-width-bg-title-fg-on-dark-bg)]'
    );

    const description = container.querySelector('.prose');
    expect(description).toHaveClass(
      'text-[var(--color-promo-animated-full-width-bg-description-fg)]',
      'group-[.container-dark-background]:text-[var(--color-promo-animated-full-width-bg-description-fg-on-dark-bg)]'
    );
  });

  it('should not alter button styling when a background-color style is selected', () => {
    const { getByTestId } = render(<FullWidthBackground {...propsWithDarkBackgroundStyle} />);

    // Primary CTA still uses the gold-token anchor styles, secondary still uses primary-blue.
    expect(getByTestId('primary-cta').className).toContain(
      '[&_a]:!bg-[var(--color-promo-animated-full-width-bg-primary-cta-bg)]'
    );
    expect(getByTestId('secondary-cta').className).toContain(
      '[&_a]:!bg-[var(--color-promo-animated-full-width-bg-secondary-cta-bg)]'
    );
  });

  it('should alias fullWidthBackground to the same variant', () => {
    const FullWidthBackgroundAlias = fullWidthBackground;
    const { container: a } = render(<FullWidthBackground {...defaultProps} />);
    const { container: b } = render(<FullWidthBackgroundAlias {...defaultProps} />);
    expect(a.querySelector('h2')).toHaveTextContent('Discover Excellence');
    expect(b.querySelector('h2')).toHaveTextContent('Discover Excellence');
  });

  it('should render NoDataFallback when fields is null', () => {
    render(<FullWidthBackground {...propsWithoutFields} />);
    expect(screen.getByTestId('no-data-fallback')).toHaveTextContent(
      'Promo Animated: Full Width Background'
    );
  });
});

describe('PromoAnimated - Reduced Motion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect prefers-reduced-motion media query', () => {
    const matchMediaMock = jest.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    window.matchMedia = matchMediaMock as typeof window.matchMedia;

    render(<PromoAnimated {...defaultProps} />);

    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});


