import React from 'react';
import { render, screen } from '@testing-library/react';
import { Default as BackgroundThumbnail } from '@/components/background-thumbnail/BackgroundThumbnail.dev';
import type { ComponentRendering, Page, PageMode } from '@sitecore-content-sdk/nextjs';

// Mock useSitecore hook
const mockUseSitecore = jest.fn();
jest.mock('@sitecore-content-sdk/nextjs', () => ({
  useSitecore: () => mockUseSitecore(),
}));

// Mock Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="badge">
      {children}
    </div>
  ),
}));

describe('BackgroundThumbnail Component', () => {
  const mockChildren = <div data-testid="child-element">Child Content</div>;
  const mockRendering = {
    componentName: 'BackgroundThumbnail',
    dataSource: '',
    params: {},
  } as ComponentRendering;

  const createPage = (isEditing: boolean): Page =>
    ({
      mode: {
        name: (isEditing ? 'edit' : 'normal') as PageMode['name'],
        isEditing,
        isPreview: false,
        isNormal: !isEditing,
        isDesignLibrary: false,
        designLibrary: { isVariantGeneration: false },
      },
      layout: {
        sitecore: {
          route: null,
        },
      } as Page['layout'],
      locale: 'en',
    }) as Page;

  const renderComponent = (
    isEditing: boolean,
    children: React.ReactElement | undefined | null = mockChildren
  ) =>
    render(
      <BackgroundThumbnail rendering={mockRendering} params={{}} page={createPage(isEditing)}>
        {children as React.ReactElement}
      </BackgroundThumbnail>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal mode (not editing)', () => {
    it('should render null when not in editing mode', () => {
      const { container } = renderComponent(false);
      expect(container.firstChild).toBeNull();
    });

    it('should not render children when not in editing mode', () => {
      renderComponent(false);
      expect(screen.queryByTestId('child-element')).not.toBeInTheDocument();
    });

    it('should not render badge when not in editing mode', () => {
      renderComponent(false);
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
    });
  });

  describe('Editing mode', () => {
    it('should render when in editing mode', () => {
      const { container } = renderComponent(true);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render children when in editing mode', () => {
      renderComponent(true);
      expect(screen.getByTestId('child-element')).toBeInTheDocument();
    });

    it('should render "Update Background" badge', () => {
      renderComponent(true);
      expect(screen.getByText('Update Background')).toBeInTheDocument();
    });

    it('should apply correct container classes', () => {
      const { container } = renderComponent(true);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-primary', 'absolute', 'bottom-4', 'right-4', 'rounded-md');
    });

    it('should apply opacity and ring classes', () => {
      const { container } = renderComponent(true);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('opacity-50', 'ring-4', 'ring-offset-2', 'hover:opacity-100');
    });

    it('should position badge correctly', () => {
      renderComponent(true);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('absolute', 'bottom-4', 'left-2/4', '-translate-x-2/4');
    });

    it('should apply nowrap and whitespace classes to badge', () => {
      renderComponent(true);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('nowrap', 'whitespace-nowrap');
    });
  });

  describe('Different children types', () => {
    it('should render with image children', () => {
      // eslint-disable-next-line @next/next/no-img-element
      const imageChild = <img src="/test.jpg" alt="Test" data-testid="image-child" />;
      renderComponent(true, imageChild);
      expect(screen.getByTestId('image-child')).toBeInTheDocument();
    });

    it('should render with complex JSX children', () => {
      const complexChildren = (
        <div>
          <h1>Title</h1>
          <p>Description</p>
        </div>
      );
      renderComponent(true, complexChildren);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render with multiple children elements', () => {
      const multipleChildren = (
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </>
      );
      renderComponent(true, multipleChildren);
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined children gracefully in editing mode', () => {
      const { container } = renderComponent(true, undefined);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Update Background')).toBeInTheDocument();
    });

    it('should handle null children gracefully in editing mode', () => {
      const { container } = renderComponent(true, null);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Update Background')).toBeInTheDocument();
    });
  });

  describe('page prop integration', () => {
    it('should react to editing mode changes from page props', () => {
      const { container, rerender } = render(
        <BackgroundThumbnail rendering={mockRendering} params={{}} page={createPage(false)}>
          {mockChildren}
        </BackgroundThumbnail>
      );
      expect(container.firstChild).toBeNull();

      rerender(
        <BackgroundThumbnail rendering={mockRendering} params={{}} page={createPage(true)}>
          {mockChildren}
        </BackgroundThumbnail>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

