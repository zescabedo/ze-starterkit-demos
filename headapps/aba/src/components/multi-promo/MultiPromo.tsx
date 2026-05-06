'use client';

import { useState, useEffect, useRef } from 'react';
import { RichText, Text } from '@sitecore-content-sdk/nextjs';
import { debounce } from 'radash';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { MultiPromoItemProps, MultiPromoProps } from './multi-promo.props';
import { Default as MultiPromoItem } from './MultiPromoItem.dev';

export const Default: React.FC<MultiPromoProps> = (props) => {
  const { fields, params, page } = props;
  const { numColumns } = params ?? {};
  const { children } = fields?.data?.datasource ?? {};
  const { title, description } = fields?.data?.datasource || {};
  const [api, setApi] = useState<CarouselApi>();
  const [announcement, setAnnouncement] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);
  const isPageEditing = page.mode.isEditing;
  // General slide handling
  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      const newIndex = api.selectedScrollSnap();

      // Announce slide change
      setAnnouncement(`Slide ${newIndex + 1} of ${children?.results.length}`);
    });

    // Add mousewheel event listener and keyboard event listener
    const debouncedHandleWheel = debounce({ delay: 100 }, (event: WheelEvent) => {
      if (event.deltaX > 0) {
        api.scrollNext();
      } else if (event.deltaX < 0) {
        api.scrollPrev();
      }
    });

    const debouncedHandleKeyDown = debounce({ delay: 100 }, (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        api?.scrollPrev();
      } else if (event.key === 'ArrowRight') {
        api?.scrollNext();
      }
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); // Prevent default scrolling behavior
        debouncedHandleKeyDown(event);
      }
    };

    const rootNode = api.rootNode();
    rootNode.addEventListener('keydown', handleKeyDown);
    rootNode.addEventListener('wheel', debouncedHandleWheel);

    return () => {
      rootNode.removeEventListener('keydown', handleKeyDown);
      debouncedHandleKeyDown.cancel();
      rootNode.removeEventListener('wheel', debouncedHandleWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  if (fields) {
    const hasPagesPositionStyles: boolean = props?.params?.styles
      ? props?.params?.styles.includes('position-')
      : false;

    return (
      <div
        data-component="MultiPromoCarousel"
        data-class-change
        className={cn(
          'multi-promo-events group-[.has-bg:not(.is-inset)]:pt-2 group-[.has-bg.is-inset]:px-0',
          {
            'position-left': !hasPagesPositionStyles,
            [props?.params?.styles]: props?.params?.styles,
          }
        )}
      >
        <div className="mx-auto max-w-screen-xl group-[.is-inset]:px-4 sm:group-[.is-inset]:px-0">
          {(title || description) && (
            <header className="multi-promo-events__intro mb-8 md:mb-10">
              {title && (
                <Text tag="h2" field={title.jsonValue} className="multi-promo-events__intro-title" />
              )}
              {description && (
                <RichText
                  className="multi-promo-events__intro-description prose prose-sm max-w-3xl [&_p]:mb-2 [&_p:last-child]:mb-0"
                  field={description.jsonValue}
                />
              )}
            </header>
          )}
          {children && (
            <>
              <Carousel
                setApi={setApi}
                opts={{
                  align: 'start',
                  breakpoints: {
                    '(min-width: 640px)': { align: 'start' },
                  },
                  loop: true,
                  skipSnaps: true,
                }}
                className="relative w-full overflow-visible"
                ref={carouselRef}
              >
                <CarouselContent
                  className={cn(
                    'multi-promo-events__track mt-0 mb-0 flex gap-[var(--gap-multi-promo-grid)] py-1 sm:py-1',
                    'last:mb-0'
                  )}
                >
                  {children?.results?.map((item: MultiPromoItemProps, index: number) => (
                    <CarouselItem
                      key={index}
                      className={cn(
                        'min-w-[min(100%,260px)] max-w-none shrink-0 grow-0 basis-[260px] pl-0 transition-opacity duration-300',
                        'sm:min-w-[45%] sm:basis-[45%]',
                        'md:min-w-[31%] md:basis-[31%]',
                        numColumns === '4'
                          ? 'lg:min-w-0 lg:flex-1 lg:basis-0 xl:min-w-[200px]'
                          : 'lg:min-w-0 lg:flex-1 lg:basis-0'
                      )}
                    >
                      <MultiPromoItem key={index} isPageEditing={isPageEditing} {...item} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                {announcement}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return <NoDataFallback componentName="Multi Promo" />;
};
