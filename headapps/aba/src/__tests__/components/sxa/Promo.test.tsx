import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Default as Promo,
  WithText as PromoWithText,
  NoImageCompressed as PromoNoImageCompressed,
} from '@/components/sxa/Promo';
import type { ImageField, Field, LinkField } from '@sitecore-content-sdk/nextjs';
import {
  defaultProps,
  propsWithoutStyles,
  propsWithoutId,
  propsWithEmptyIcon,
  propsWithEmptyText,
  propsWithEmptyLink,
  propsEmpty,
  mockTextFieldEmpty,
} from './Promo.mockProps';

/** Default promo variant: featured tile + right image (aba.com-style field mapping). */
const propsPromoDefaultFeaturedWithImage = {
  ...defaultProps,
  fields: {
    ...defaultProps.fields,
    PromoText: mockTextFieldEmpty,
    Text: { value: '<p>Resource</p>' },
    'Text 2': { value: 'April is Financial Literacy Month' },
    'Text 3': {
      value:
        '<p>Help educate visitors about financial literacy with free resources from the ABA Foundation.</p>',
    },
    Link: defaultProps.fields.PromoLink,
  },
};

interface MockNextImageProps {
  field?: ImageField;
  [key: string]: unknown;
}

interface MockRichTextProps {
  field?: Field<string>;
  className?: string;
}

interface MockTextProps {
  field?: Field<string>;
  className?: string;
  tag?: string;
}

interface MockLinkProps {
  field?: LinkField;
  children?: React.ReactNode;
  className?: string;
}

jest.mock('@sitecore-content-sdk/nextjs', () => {
  function rteHtml(
    field:
      | {
          value?: string;
          editable?: string;
          jsonValue?: { value?: string; editable?: string; rendered?: string };
        }
      | undefined,
  ): string {
    if (!field) return '';
    if (typeof field.value === 'string' && field.value.trim() !== '') return field.value;
    if (typeof field.editable === 'string' && field.editable.trim() !== '') return field.editable;
    const jv = field.jsonValue;
    if (jv && typeof jv === 'object') {
      if (typeof jv.editable === 'string' && jv.editable.trim() !== '') return jv.editable;
      if (typeof jv.rendered === 'string' && jv.rendered.trim() !== '') return jv.rendered;
      const v = jv.value;
      if (typeof v === 'string') return v;
    }
    return '';
  }

  function linkHref(
    field: { value?: { href?: string }; jsonValue?: { value?: { href?: string } } } | undefined,
  ): string {
    if (!field) return '#';
    const h = field.value?.href || field.jsonValue?.value?.href;
    return h && h.trim() !== '' ? h : '#';
  }

  return {
    NextImage: ({ field, ...props }: MockNextImageProps) => {
      if (!field?.value) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img data-testid="promo-image" alt="" />;
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={(field.value.src as string | undefined) || ''}
          alt={(field.value.alt as string | undefined) || ''}
          {...props}
          data-testid="promo-image"
        />
      );
    },
    RichText: ({ field, className }: MockRichTextProps) => (
      <div className={className} dangerouslySetInnerHTML={{ __html: rteHtml(field) }} />
    ),
    Text: ({ field, className, tag = 'span' }: MockTextProps) =>
      React.createElement(tag, { className, 'data-testid': 'promo-sdk-text' }, rteHtml(field)),
    Link: ({ field, children, className }: MockLinkProps) => (
      <a href={linkHref(field)} data-testid="promo-link" className={className}>
        {children}
      </a>
    ),
  };
});

describe('Promo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Default Promo Component', () => {
    it('should render promo with icon, text, and link', () => {
      render(<Promo {...propsPromoDefaultFeaturedWithImage} />);

      expect(screen.getByTestId('promo-image')).toBeInTheDocument();
      expect(screen.getByText('April is Financial Literacy Month')).toBeInTheDocument();
      expect(
        screen.getByText(/Help educate visitors about financial literacy with free resources/),
      ).toBeInTheDocument();
      expect(screen.getByTestId('promo-link')).toBeInTheDocument();
      const root = screen.getByTestId('promo-image').closest('.component.promo');
      expect(root).toHaveClass('promo--featured-tile-with-image');
      expect(root?.querySelector('.promo-featured-tile__grid')).toBeInTheDocument();
      expect(screen.getByTestId('promo-image').closest('.promo-featured-tile__media')).toBeInTheDocument();
    });

    it('should render with correct container structure', () => {
      render(<Promo {...propsPromoDefaultFeaturedWithImage} />);

      const container = screen.getByTestId('promo-image').closest('.component.promo');
      expect(container).toHaveClass('component', 'promo', 'custom-promo-style');

      const contentDiv = container?.querySelector('.component-content');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should apply custom styles', () => {
      render(<Promo {...propsPromoDefaultFeaturedWithImage} />);

      const container = screen.getByTestId('promo-image').closest('.component.promo');
      expect(container).toHaveClass('custom-promo-style');
    });

    it('should render without custom styles when not provided', () => {
      render(
        <Promo
          {...propsPromoDefaultFeaturedWithImage}
          params={{ ...propsPromoDefaultFeaturedWithImage.params, styles: '' }}
        />,
      );

      const container = screen.getByTestId('promo-image').closest('.component.promo');
      expect(container).toHaveClass('component', 'promo');
      expect(container).not.toHaveClass('custom-promo-style');
    });

    it('should have correct rendering identifier', () => {
      render(<Promo {...propsPromoDefaultFeaturedWithImage} />);

      const container = screen.getByTestId('promo-image').closest('.component.promo');
      expect(container).toHaveAttribute('id', 'promo-rendering-id');
    });

    it('should render without id when RenderingIdentifier is not provided', () => {
      render(
        <Promo
          {...propsPromoDefaultFeaturedWithImage}
          params={{ ...propsPromoDefaultFeaturedWithImage.params, RenderingIdentifier: '' }}
        />,
      );

      const container = screen.getByTestId('promo-image').closest('.component.promo');
      expect(container).not.toHaveAttribute('id');
    });

    it('should render PromoDefaultComponent when fields are not provided', () => {
      const propsWithoutFields = {
        ...defaultProps,
        fields: null as unknown as typeof defaultProps.fields,
      };

      render(<Promo {...propsWithoutFields} />);

      expect(screen.getByText('Promo')).toBeInTheDocument();
      expect(screen.getByText('Promo')).toHaveClass('is-empty-hint');
    });

    it('should render PromoDefaultComponent when fields are empty', () => {
      const propsWithNullFields = {
        params: propsEmpty.params,
        fields: null as unknown as typeof defaultProps.fields,
      };

      render(<Promo {...propsWithNullFields} />);

      expect(screen.getByText('Promo')).toBeInTheDocument();
      expect(screen.getByText('Promo')).toHaveClass('is-empty-hint');
    });
  });

  describe('NoImageCompressed Promo Component', () => {
    const propsNoImageCompressed = {
      ...defaultProps,
      fields: {
        ...defaultProps.fields,
        PromoText: mockTextFieldEmpty,
        Text: { value: '<p>Resource</p>' },
        'Text 2': { value: 'Older Americans Month' },
        'Text 3': {
          value:
            '<p>Help educate seniors and their families on avoiding scams, supporting financial caregiving and more with free resources.</p>',
        },
        Link: defaultProps.fields.PromoLink,
      },
    };

    it('should render featured-tile layout without promo image', () => {
      render(<PromoNoImageCompressed {...propsNoImageCompressed} />);

      expect(screen.queryByTestId('promo-image')).not.toBeInTheDocument();

      const tile = document.querySelector(
        '.promo--no-image-compressed .featured-tile.featured-tile--without-image--light',
      );
      expect(tile).toBeInTheDocument();
    });

    it('should render outline tag and call-to-action link', () => {
      render(<PromoNoImageCompressed {...propsNoImageCompressed} />);

      expect(
        document.querySelector('.promo--no-image-compressed .promo-no-image-pill.tag.tag--outline'),
      ).toBeInTheDocument();
      const link = screen.getByTestId('promo-link');
      expect(link).toHaveClass('call-to-action');
      expect(link).toHaveAttribute('href', '/test-promo-link');
    });

    it('should map Text 2 to headline and Text 3 to body', () => {
      render(<PromoNoImageCompressed {...propsNoImageCompressed} />);

      expect(screen.getByText('Older Americans Month')).toBeInTheDocument();
      expect(
        screen.getByText(/Help educate seniors and their families on avoiding scams/),
      ).toBeInTheDocument();
    });

    it('should map SXA API field names PromoText2 and PromoText3 to headline and body', () => {
      render(
        <PromoNoImageCompressed
          {...defaultProps}
          fields={{
            ...defaultProps.fields,
            PromoText: mockTextFieldEmpty,
            text: { value: '<p>Resources</p>' },
            PromoText2: { value: 'Older Americans Month' },
            PromoText3: {
              value:
                '<p>Help educate seniors and their families on avoiding scams, supporting financial caregiving and more with free resources.</p>',
            },
            PromoLink: defaultProps.fields.PromoLink,
          }}
        />,
      );

      expect(screen.getByText('Older Americans Month')).toBeInTheDocument();
      expect(
        screen.getByText(/Help educate seniors and their families on avoiding scams/),
      ).toBeInTheDocument();
    });

    it('should render both PromoText and PromoText3 when both have content', () => {
      render(
        <PromoNoImageCompressed
          {...defaultProps}
          fields={{
            ...defaultProps.fields,
            text: { value: '<p>Resources</p>' },
            PromoText2: { value: 'Card title' },
            PromoText: { value: '<p>Primary copy from PromoText field.</p>' },
            PromoText3: { value: '<p>Additional copy from PromoText3.</p>' },
            PromoLink: defaultProps.fields.PromoLink,
          }}
        />,
      );

      expect(screen.getByText('Card title')).toBeInTheDocument();
      expect(screen.getByText(/Primary copy from PromoText field/)).toBeInTheDocument();
      expect(screen.getByText(/Additional copy from PromoText3/)).toBeInTheDocument();
    });

    it('should resolve Text / Text 2 / Text 3 from fields.data.datasource when nested under layout payload', () => {
      render(
        <PromoNoImageCompressed
          {...defaultProps}
          fields={{
            PromoIcon: defaultProps.fields.PromoIcon,
            PromoText: mockTextFieldEmpty,
            PromoLink: defaultProps.fields.PromoLink,
            PromoText2: defaultProps.fields.PromoText2,
            data: {
              datasource: {
                Text: { value: '<p>Resource</p>' },
                'Text 2': { value: 'Older Americans Month' },
                'Text 3': {
                  value:
                    '<p>Help educate seniors and their families on avoiding scams, supporting financial caregiving and more with free resources.</p>',
                },
                Link: defaultProps.fields.PromoLink,
              },
            },
          }}
        />,
      );

      expect(screen.getByText('Older Americans Month')).toBeInTheDocument();
      expect(
        screen.getByText(/Help educate seniors and their families on avoiding scams/),
      ).toBeInTheDocument();
    });

    it('should use jsonValue.editable for headline and body when value is empty (Edge payload)', () => {
      render(
        <PromoNoImageCompressed
          {...defaultProps}
          fields={{
            PromoIcon: defaultProps.fields.PromoIcon,
            PromoText: mockTextFieldEmpty,
            PromoLink: defaultProps.fields.PromoLink,
            PromoText2: defaultProps.fields.PromoText2,
            Text: { jsonValue: { value: '', editable: '<p>Resource</p>' } } as unknown as Field<string>,
            'Text 2': {
              jsonValue: { value: '', editable: 'Older Americans Month' },
            } as unknown as Field<string>,
            'Text 3': {
              jsonValue: { value: '', editable: '<p>Edge editable body.</p>' },
            } as unknown as Field<string>,
            Link: {
              jsonValue: {
                value: {
                  href: '/test-promo-link',
                  text: 'Access resources',
                },
              },
            } as unknown as LinkField,
          }}
        />,
      );

      expect(screen.getByText('Older Americans Month')).toBeInTheDocument();
      expect(screen.getByText(/Edge editable body/)).toBeInTheDocument();
    });

    it('should resolve Text / Text 2 / Text 3 from jsonValue.value when top-level value is absent', () => {
      render(
        <PromoNoImageCompressed
          {...defaultProps}
          fields={{
            PromoIcon: defaultProps.fields.PromoIcon,
            PromoText: mockTextFieldEmpty,
            PromoLink: defaultProps.fields.PromoLink,
            PromoText2: defaultProps.fields.PromoText2,
            Text: { jsonValue: { value: '<p>Resource</p>' } } as unknown as Field<string>,
            'Text 2': { jsonValue: { value: 'Older Americans Month' } } as unknown as Field<string>,
            'Text 3': {
              jsonValue: {
                value:
                  '<p>Help educate seniors and their families on avoiding scams, supporting financial caregiving and more with free resources.</p>',
              },
            } as unknown as Field<string>,
            Link: {
              jsonValue: {
                value: {
                  href: '/test-promo-link',
                  text: 'Access resources',
                },
              },
            } as unknown as LinkField,
          }}
        />,
      );

      expect(screen.getByText('Older Americans Month')).toBeInTheDocument();
      expect(
        screen.getByText(/Help educate seniors and their families on avoiding scams/),
      ).toBeInTheDocument();
      expect(screen.getByTestId('promo-link')).toHaveAttribute('href', '/test-promo-link');
    });

    it('should omit tag when Text and legacy PromoText2 are empty', () => {
      render(
        <PromoNoImageCompressed
          {...defaultProps}
          fields={{
            ...defaultProps.fields,
            Text: { value: '' },
            text: { value: '' },
            PromoText2: { value: '' },
          }}
        />,
      );

      expect(document.querySelector('.promo--no-image-compressed .promo-no-image-pill')).toBeNull();
    });

    it('should use short PromoText as pill when Text is empty and headline exists (no duplicate body)', () => {
      render(
        <PromoNoImageCompressed
          {...defaultProps}
          fields={{
            ...defaultProps.fields,
            Text: { value: '' },
            text: { value: '' },
            PromoText: { value: '<p>Resources</p>' },
            PromoText2: { value: 'Older Americans Month' },
            PromoText3: {
              value:
                '<p>Help educate seniors and their families on avoiding scams, supporting financial caregiving and more with free resources.</p>',
            },
          }}
        />,
      );

      expect(
        document.querySelector('.promo--no-image-compressed .promo-no-image-pill'),
      ).toBeInTheDocument();
      expect(screen.getByText('Older Americans Month')).toBeInTheDocument();
      expect(screen.getAllByText(/Resources/).length).toBe(1);
      expect(
        screen.getByText(/Help educate seniors and their families on avoiding scams/),
      ).toBeInTheDocument();
    });

    it('should render PromoDefaultComponent when fields are not provided', () => {
      render(
        <PromoNoImageCompressed
          {...defaultProps}
          fields={null as unknown as typeof defaultProps.fields}
        />,
      );

      expect(screen.getByText('Promo')).toBeInTheDocument();
      expect(screen.getByText('Promo')).toHaveClass('is-empty-hint');
    });
  });

  describe('WithText Promo Component', () => {
    it('should render promo with icon and two text fields', () => {
      render(<PromoWithText {...defaultProps} />);

      expect(screen.getByTestId('promo-image')).toBeInTheDocument();
      expect(screen.getAllByText('Test Promo Text')).toHaveLength(2);
    });

    it('should render with correct container structure', () => {
      render(<PromoWithText {...defaultProps} />);

      const container = screen.getByTestId('promo-image').closest('.component.promo');
      expect(container).toHaveClass('component', 'promo', 'custom-promo-style');

      const contentDiv = container?.querySelector('.component-content');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should apply custom styles', () => {
      render(<PromoWithText {...defaultProps} />);

      const container = screen.getByTestId('promo-image').closest('.component.promo');
      expect(container).toHaveClass('custom-promo-style');
    });

    it('should have correct rendering identifier', () => {
      render(<PromoWithText {...defaultProps} />);

      const container = screen.getByTestId('promo-image').closest('.component.promo');
      expect(container).toHaveAttribute('id', 'promo-rendering-id');
    });

    it('should render PromoDefaultComponent when fields are not provided', () => {
      const propsWithoutFields = {
        ...defaultProps,
        fields: null as unknown as typeof defaultProps.fields,
      };

      render(<PromoWithText {...propsWithoutFields} />);

      expect(screen.getByText('Promo')).toBeInTheDocument();
      expect(screen.getByText('Promo')).toHaveClass('is-empty-hint');
    });
  });

  describe('Component structure', () => {
    it('should render correct DOM structure for Default component', () => {
      render(<Promo {...propsPromoDefaultFeaturedWithImage} />);

      const container = screen.getByTestId('promo-image').closest('.component.promo');
      expect(container).toHaveClass('component', 'promo', 'custom-promo-style');

      const contentDiv = container?.querySelector('.component-content');
      expect(contentDiv).toBeInTheDocument();

      const iconDiv = contentDiv?.querySelector('.promo-featured-tile__media.field-promoicon');
      expect(iconDiv).toBeInTheDocument();

      expect(contentDiv?.querySelector('.promo-featured-tile__grid')).toBeInTheDocument();
      expect(contentDiv?.querySelector('.featured-tile.featured-tile--without-image--light')).toBeInTheDocument();
    });

    it('should render correct DOM structure for WithText component', () => {
      render(<PromoWithText {...defaultProps} />);

      const container = screen.getByTestId('promo-image').closest('.component.promo');
      expect(container).toHaveClass('component', 'promo', 'custom-promo-style');

      const contentDiv = container?.querySelector('.component-content');
      expect(contentDiv).toBeInTheDocument();

      const iconDiv = contentDiv?.querySelector('.field-promoicon');
      expect(iconDiv).toBeInTheDocument();

      const promoTextDiv = contentDiv?.querySelector('.promo-text');
      expect(promoTextDiv).toBeInTheDocument();
    });
  });

  describe('Field rendering', () => {
    it('should render promo icon with correct attributes', () => {
      render(<Promo {...propsPromoDefaultFeaturedWithImage} />);

      const image = screen.getByTestId('promo-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-promo-icon.jpg');
      expect(image).toHaveAttribute('alt', 'Promo Icon');
    });

    it('should render promo text with correct content', () => {
      render(<Promo {...propsPromoDefaultFeaturedWithImage} />);

      const textContent = screen.getByText(/Help educate visitors about financial literacy/);
      expect(textContent).toBeInTheDocument();

      const textContainer = textContent.closest('.field-promotext');
      expect(textContainer).toBeInTheDocument();
    });

    it('should render promo link with correct href', () => {
      render(<Promo {...propsPromoDefaultFeaturedWithImage} />);

      const link = screen.getByTestId('promo-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test-promo-link');
    });

    it('should render both text fields in WithText component', () => {
      render(<PromoWithText {...defaultProps} />);

      const textDivs = screen.getAllByText('Test Promo Text');
      expect(textDivs).toHaveLength(2);

      textDivs.forEach((div) => {
        expect(div).toHaveClass('promo-text');
        const textContainer = div.closest('.field-promotext');
        expect(textContainer).toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty icon field', () => {
      render(<Promo {...propsWithEmptyIcon} />);

      const container = document.querySelector('.component.promo');
      expect(container).toHaveClass('promo--no-image-compressed');
      expect(screen.queryByTestId('promo-image')).toBeNull();
    });

    it('should handle empty text field', () => {
      render(<Promo {...propsWithEmptyText} />);

      const root = document.querySelector('.component.promo');
      expect(root).toHaveClass('promo--featured-tile-with-image');
      expect(root?.querySelector('.field-promotext')).toBeNull();
    });

    it('should handle empty link field', () => {
      render(<Promo {...propsWithEmptyLink} />);

      expect(screen.queryByTestId('promo-link')).toBeNull();
    });

    it('should handle missing params gracefully', () => {
      const propsWithoutParams = {
        params: {},
        fields: propsPromoDefaultFeaturedWithImage.fields,
      };

      render(<Promo {...propsWithoutParams} />);

      const container = screen.getByTestId('promo-image').closest('.component.promo');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('component', 'promo');
    });
  });

  describe('CSS classes', () => {
    it('should apply correct CSS classes to elements', () => {
      render(<Promo {...propsPromoDefaultFeaturedWithImage} />);

      const iconDiv = screen.getByTestId('promo-image').closest('.field-promoicon');
      expect(iconDiv).toBeInTheDocument();

      const bodyRichtext = screen
        .getByText(/Help educate visitors about financial literacy/)
        .closest('.promo-no-image-compressed__body-richtext');
      expect(bodyRichtext).toBeInTheDocument();

      const textContainer = screen
        .getByText(/Help educate visitors about financial literacy/)
        .closest('.field-promotext');
      expect(textContainer).toBeInTheDocument();

      const linkDiv = screen.getByTestId('promo-link').closest('.field-promolink');
      expect(linkDiv).toBeInTheDocument();
    });

    it('should apply promo-text class to RichText in WithText component', () => {
      render(<PromoWithText {...defaultProps} />);

      const textDivs = screen.getAllByText('Test Promo Text');
      textDivs.forEach((div) => {
        expect(div).toHaveClass('promo-text');
        const parentContainer = div.closest('.field-promotext');
        expect(parentContainer).toBeInTheDocument();
      });
    });
  });
});
