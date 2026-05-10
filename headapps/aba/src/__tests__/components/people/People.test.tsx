import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as PeopleDefault, NoImage as PeopleNoImage } from '@/components/people/People';
import type { ImageField, Field, LinkField } from '@sitecore-content-sdk/nextjs';
import type { PeopleProps } from '@/components/people/people.props';
import type { Page } from '@sitecore-content-sdk/nextjs';

type MockImageField = ImageField & {
  jsonValue?: { value?: { src?: string; alt?: string } };
};

interface MockNextImageProps {
  field?: MockImageField;
  [key: string]: unknown;
}

interface MockTextProps {
  field?: Field<string>;
  className?: string;
  tag?: string;
}

interface MockLinkProps {
  field?: LinkField;
  className?: string;
  children?: React.ReactNode;
}

interface MockRichTextProps {
  field?: Field<string>;
  className?: string;
}

function textFromField(
  field:
    | {
        value?: string;
        jsonValue?: { value?: string };
      }
    | undefined,
): string {
  if (!field) return '';
  if (typeof field.value === 'string' && field.value.trim() !== '') return field.value;
  const v = field.jsonValue?.value;
  return typeof v === 'string' ? v : '';
}

jest.mock('@sitecore-content-sdk/nextjs', () => ({
  Link: ({ field, className, children }: MockLinkProps) => {
    const href =
      field?.value?.href ||
      (field as { jsonValue?: { value?: { href?: string } } })?.jsonValue?.value?.href ||
      '#';
    return (
      <a href={href} className={className} data-testid="people-link">
        {children}
      </a>
    );
  },
  NextImage: ({ field, ...props }: MockNextImageProps) => {
    const src = field?.value?.src || field?.jsonValue?.value?.src;
    const alt =
      typeof field?.value?.alt === 'string' && field.value.alt ? field.value.alt : '';
    if (!src) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img data-testid="people-image" alt="" {...props} />;
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} {...props} data-testid="people-image" />
    );
  },
  Text: ({ field, className, tag = 'span' }: MockTextProps) =>
    React.createElement(tag, { className, 'data-testid': 'people-text' }, textFromField(field)),
  RichText: ({ field, className }: MockRichTextProps) => (
    <div className={className} data-testid="people-description-richtext">
      {textFromField(field)}
    </div>
  ),
}));

const mockPage = {
  mode: { isEditing: false, isDesignLibrary: false },
} as unknown as Page;

const mockRendering = {
  componentName: 'People',
  uid: 'people-test',
} as PeopleProps['rendering'];

const fieldsWithImage = {
  FirstName: { jsonValue: { value: 'Jordan' } as Field<string> },
  LastName: { jsonValue: { value: 'Lee' } as Field<string> },
  HeadshotImage: {
    value: { src: '/headshot.jpg', alt: 'Jordan Lee' },
  } as ImageField,
  JobTitle: { jsonValue: { value: 'VP, Engineering' } as Field<string> },
  Department: { jsonValue: { value: 'Technology' } as Field<string> },
  Company: { jsonValue: { value: 'ABA' } as Field<string> },
  City: { jsonValue: { value: 'Washington' } as Field<string> },
  State: { jsonValue: { value: 'DC' } as Field<string> },
  Country: { jsonValue: { value: 'USA' } as Field<string> },
  Link: {
    value: { href: '/people/jordan-lee', text: 'View profile' },
  } as LinkField,
  Description: {
    jsonValue: { value: 'Bio paragraph for Jordan.' } as Field<string>,
  },
};

const baseProps: Pick<PeopleProps, 'params' | 'rendering' | 'page'> = {
  params: { styles: 'indent-top', RenderingIdentifier: 'people-1' },
  rendering: mockRendering,
  page: mockPage,
};

describe('People', () => {
  it('renders Default with image column when HeadshotImage has src', () => {
    render(<PeopleDefault {...baseProps} fields={fieldsWithImage} />);

    expect(screen.getByTestId('people-image')).toBeInTheDocument();
    expect(screen.getByText('Jordan')).toBeInTheDocument();
    expect(screen.getByText('Lee')).toBeInTheDocument();
    expect(screen.getByText('VP, Engineering')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('ABA')).toBeInTheDocument();
    expect(screen.getByText('Washington, DC, USA')).toBeInTheDocument();

    const descWrap = document.querySelector('.people-card__description');
    expect(descWrap).toBeInTheDocument();
    expect(descWrap).toHaveClass(
      'featured-tile__body',
      'promo-no-image-compressed__body',
      'promo-no-image-compressed__body--promotext3',
    );
    expect(screen.getByTestId('people-description-richtext')).toHaveClass(
      'promo-no-image-compressed__body-richtext',
    );
    expect(screen.getByText('Bio paragraph for Jordan.')).toBeInTheDocument();

    const link = screen.getByTestId('people-link');
    expect(link).toHaveClass('call-to-action');
    expect(link).toHaveAttribute('href', '/people/jordan-lee');
    expect(link.closest('.field-peoplelink')).toBeInTheDocument();

    const root = screen.getByTestId('people-image').closest('.component.people');
    expect(root).toHaveAttribute('data-people-layout', 'with-image');
    expect(root?.querySelector('.people-card__grid')).toBeInTheDocument();
  });

  it('merges Styles onto root and applies image-left orientation from params', () => {
    render(
      <PeopleDefault
        {...baseProps}
        params={{
          ...baseProps.params,
          Styles: 'position-center indent-bottom',
          orientation: 'Image Left',
        }}
        fields={fieldsWithImage}
      />,
    );

    const root = screen.getByTestId('people-image').closest('.component.people');
    expect(root).toHaveClass('people--image-left', 'position-center', 'indent-bottom', 'indent-top');
  });

  it('renders Default without image column when HeadshotImage is empty', () => {
    render(
      <PeopleDefault
        {...baseProps}
        fields={{
          ...fieldsWithImage,
          HeadshotImage: { value: { src: '', alt: '' } } as ImageField,
        }}
      />,
    );

    expect(screen.queryByTestId('people-image')).not.toBeInTheDocument();
    const root = screen.getByText('Jordan').closest('.component.people');
    expect(root).toHaveAttribute('data-people-layout', 'no-image');
  });

  it('NoImage variant never renders headshot even when provided', () => {
    render(<PeopleNoImage {...baseProps} fields={fieldsWithImage} />);

    expect(screen.queryByTestId('people-image')).not.toBeInTheDocument();
    expect(screen.getByText('Jordan')).toBeInTheDocument();
    const root = screen.getByText('Jordan').closest('.component.people');
    expect(root).toHaveAttribute('data-people-layout', 'no-image');
  });

  it('shows NoDataFallback when fields are missing', () => {
    render(<PeopleDefault {...baseProps} fields={undefined as unknown as PeopleProps['fields']} />);
    expect(
      screen.getByText(/People requires a datasource item assigned/i),
    ).toBeInTheDocument();
  });

  it('renders link when href only exists under jsonValue.value (Edge layout)', () => {
    render(
      <PeopleDefault
        {...baseProps}
        fields={{
          ...fieldsWithImage,
          Link: {
            value: { href: '', text: '' },
            jsonValue: { value: { href: '/from-json-value', text: 'Profile' } },
          } as unknown as LinkField,
        }}
      />,
    );

    const link = screen.getByTestId('people-link');
    expect(link).toHaveAttribute('href', '/from-json-value');
  });

  it('reads nested data.datasource fields', () => {
    render(
      <PeopleDefault
        {...baseProps}
        fields={{
          data: {
            datasource: {
              FirstName: { jsonValue: { value: 'Sam' } as Field<string> },
              LastName: { jsonValue: { value: 'Pat' } as Field<string> },
              JobTitle: { jsonValue: { value: 'Analyst' } as Field<string> },
            },
          },
        }}
      />,
    );

    expect(screen.getByText('Sam')).toBeInTheDocument();
    expect(screen.getByText('Pat')).toBeInTheDocument();
    expect(screen.getByText('Analyst')).toBeInTheDocument();
  });
});
