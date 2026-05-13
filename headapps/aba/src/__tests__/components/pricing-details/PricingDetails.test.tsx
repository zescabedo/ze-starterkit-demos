import { render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';

jest.mock('@sitecore-content-sdk/nextjs', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock factory runs before ESM imports resolve
  const React = require('react');
  return {
    Text: ({
      field,
      tag,
      className,
    }: {
      field?: { value?: string | number | null };
      tag?: keyof JSX.IntrinsicElements;
      className?: string;
    }) => {
      const Tag = (tag || 'span') as keyof JSX.IntrinsicElements;
      const text =
        field?.value === null || field?.value === undefined ? '' : String(field.value);
      return React.createElement(Tag, { className }, text);
    },
    RichText: ({ field }: { field?: { value?: string } }) =>
      React.createElement('div', { 'data-testid': 'richtext' }, field?.value ?? ''),
  };
});

jest.mock('@/utils/NoDataFallback', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- jest.mock factory runs before ESM imports resolve
  const React = require('react');
  return {
    NoDataFallback: ({ componentName }: { componentName: string }) =>
      React.createElement('div', null, `${componentName} requires a datasource item assigned.`),
  };
});

jest.mock('@/components/auth-demo/SimulatedLoginModal', () => ({
  SimulatedLoginModal: () => null,
}));

import { SimulatedMemberAuthProvider } from '@/contexts/SimulatedMemberAuthContext';
import { Default as PricingDetails } from '@/components/pricing-details/PricingDetails';
import type { PricingDetailsProps } from '@/components/pricing-details/pricing-details.props';
import type { ComponentRendering, Page, PageMode } from '@sitecore-content-sdk/nextjs';

const DEMO_STORAGE_KEY = 'aba-demo-member-tier';

const mockRendering: ComponentRendering = {
  componentName: 'PricingDetails',
  dataSource: '',
  params: {},
};

const mockPage: Page = {
  mode: {
    name: 'normal' as PageMode['name'],
    isEditing: false,
    isPreview: false,
    isNormal: true,
    isDesignLibrary: false,
    designLibrary: { isVariantGeneration: false },
  },
  layout: {
    sitecore: {
      route: null,
    },
  } as Page['layout'],
  locale: 'en',
};

const baseFields: PricingDetailsProps['fields'] = {
  data: {
    datasource: {
      productTypeTitle: { jsonValue: { value: 'Webinar' } },
      memberPriceLabel: { jsonValue: { value: 'ABA Member Price' } },
      nonMemberPriceLabel: { jsonValue: { value: 'Non-Member Price' } },
      savingsIntro: { jsonValue: { value: 'Save' } },
      creditCost: { jsonValue: { value: 2 } },
      footnote: { jsonValue: { value: '<p>Registration includes access.</p>' } },
    },
  },
};

function renderWithAuth(ui: ReactElement, storageTier?: string) {
  try {
    sessionStorage.clear();
    if (storageTier) {
      sessionStorage.setItem(DEMO_STORAGE_KEY, storageTier);
    }
  } catch {
    // ignore
  }
  return render(<SimulatedMemberAuthProvider>{ui}</SimulatedMemberAuthProvider>);
}

describe('PricingDetails', () => {
  beforeEach(() => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
  });

  it('renders NoDataFallback when datasource is missing', () => {
    const props: PricingDetailsProps = {
      rendering: mockRendering,
      fields: { data: {} },
      params: {},
      page: mockPage,
    };
    renderWithAuth(<PricingDetails {...props} />);
    expect(screen.getByText('Pricing Details requires a datasource item assigned.')).toBeInTheDocument();
  });

  it('shows non-member row and sign-in prompt when anonymous', async () => {
    const props: PricingDetailsProps = {
      rendering: mockRendering,
      fields: baseFields,
      params: {},
      page: mockPage,
    };
    renderWithAuth(<PricingDetails {...props} />);
    await waitFor(() => {
      expect(screen.getByText('Webinar')).toBeInTheDocument();
    });
    expect(screen.getByText(/\$310\.00/)).toBeInTheDocument();
    expect(screen.queryByText(/32% as a member/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\$210\.00/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in to see member pricing/i })).toBeInTheDocument();
    expect(screen.queryByTestId('pricing-credit-cost')).not.toBeInTheDocument();
  });

  it('hides non-member row when authenticated as bank', async () => {
    const props: PricingDetailsProps = {
      rendering: mockRendering,
      fields: baseFields,
      params: {},
      page: mockPage,
    };
    renderWithAuth(<PricingDetails {...props} />, 'bank');
    await waitFor(() => {
      expect(screen.getByText(/Bank member pricing/)).toBeInTheDocument();
    });
    expect(screen.queryByText(/\$310\.00/)).not.toBeInTheDocument();
    expect(screen.getByText(/32% as a member/)).toBeInTheDocument();
    const credit = screen.getByTestId('pricing-credit-cost');
    expect(credit).toHaveTextContent('Credits');
    expect(credit).toHaveTextContent('2');
  });

  it('hides credit cost for authenticated users when value is unset', async () => {
    const { creditCost: _c, ...restDs } = baseFields.data!.datasource!;
    const props: PricingDetailsProps = {
      rendering: mockRendering,
      fields: { data: { datasource: restDs } },
      params: {},
      page: mockPage,
    };
    renderWithAuth(<PricingDetails {...props} />, 'bank');
    await waitFor(() => {
      expect(screen.getByText(/Bank member pricing/)).toBeInTheDocument();
    });
    expect(screen.queryByTestId('pricing-credit-cost')).not.toBeInTheDocument();
  });

  it('shows credit field in Experience Editor when anonymous', async () => {
    const editingPage: Page = {
      ...mockPage,
      mode: {
        ...mockPage.mode,
        isEditing: true,
        isNormal: false,
      },
    };
    const props: PricingDetailsProps = {
      rendering: mockRendering,
      fields: baseFields,
      params: {},
      page: editingPage,
    };
    renderWithAuth(<PricingDetails {...props} />);
    await waitFor(() => {
      expect(screen.getByText('Webinar')).toBeInTheDocument();
    });
    expect(screen.getByTestId('pricing-credit-cost')).toBeInTheDocument();
  });
});
