import { Meteors } from '@/components/magicui/meteors';
import { getPlainTextFromSitecoreField } from '@/components/text-banner/text-banner-field-utils';
import { buttonVariants } from '@/components/ui/button';
import type React from 'react';
import { Text } from '@sitecore-content-sdk/nextjs';
import { TopicListingProps } from './topic-listing.props';
import { flattenTopicLinkResultItem, getTopicListingDatasource } from './topic-listing-field-utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { TopicItem } from './TopicItem.dev';
import { cn } from '@/lib/utils';

export const Default: React.FC<TopicListingProps> = (props) => {
  const {
    fields,
    params: { backgroundTheme },
    page
  } = props;
  const isPageEditing = page?.mode?.isEditing;
  const ds = getTopicListingDatasource(fields);
  const { title, children, button: buttonField } = ds;
  const buttonPlain = (getPlainTextFromSitecoreField(buttonField) ?? '').trim();
  const showListingButton = Boolean(isPageEditing || buttonPlain.length > 0);

  if (fields) {
    return (
      <div
        className="@container bg-primary text-primary-foreground relative overflow-hidden py-24 md:pb-[128px] md:pt-28"
        data-class-change
      >
        {backgroundTheme === 'shooting-star' && (
          <div
            className="absolute inset-0 z-10"
            style={
              {
                '--meteor-color': '255, 255, 255',
                '--meteor-opacity': '0.6',
              } as React.CSSProperties
            }
          >
            <Meteors
              number={40}
              minDelay={0.2}
              maxDelay={1.5}
              minDuration={18}
              maxDuration={38}
              angle={310}
              size="3"
            />
          </div>
        )}
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-16 text-center md:gap-24">
            <div className="flex max-w-4xl flex-col items-center gap-4">
              {title && (
                <Text
                  tag="h2"
                  field={title?.jsonValue}
                  className="font-heading @sm:text-5xl @md:text-6xl @lg:text-7xl text-4xl font-semibold leading-tight tracking-normal text-primary-foreground"
                />
              )}
            </div>
            <div className="flex w-full max-w-6xl flex-col items-center gap-12 md:gap-16">
              {children?.results && children.results.length > 0 ? (
                <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
                  {children.results.map((topic, index) => (
                    <TopicItem
                      key={index}
                      {...flattenTopicLinkResultItem(topic)}
                      isPageEditing={isPageEditing}
                    />
                  ))}
                </div>
              ) : null}
              {showListingButton ? (
                <div
                  className={cn(
                    buttonVariants({ variant: 'rounded-white' }),
                    'inline-flex items-center justify-center px-8 py-3'
                  )}
                >
                  <Text
                    tag="span"
                    field={buttonField?.jsonValue ?? { value: '' }}
                    className="text-sm font-bold uppercase tracking-wide text-heading"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <NoDataFallback componentName="Topic Listing" />;
};
