import type React from 'react';
import {
  getContainerPlaceholderProps,
  hasContainer7030AlignTopStyle,
  isContainerPlaceholderEmpty,
  stripContainer7030AlignTopStyle,
} from '@/components/container/container.util';
import { Flex, FlexItem } from '@/components/flex/Flex.dev';
import * as e from '@/lib/enum';
import { cn } from '@/lib/utils';
import { PlaceholderProps } from '@/types/Placeholder.props';
import { ComponentProps } from '@/lib/component-props';
import type { JSX } from 'react';
import componentMap from '@/lib/sitecore-component-map';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';

/**
 * Model used for Sitecore Component integration
 */
type Container7030Props = ComponentProps &
  PlaceholderProps & {
    left?: JSX.Element;
    right?: JSX.Element;
  };

export const Default: React.FC<Container7030Props> = (props) => {
  const { rendering, left, right, page } = props;

  const isPageEditing = page.mode.isEditing;

  const leftPlaceholders = getContainerPlaceholderProps(
    'container-seventy-left',
    props.params,
  );
  const rightPlaceholders = getContainerPlaceholderProps(
    'container-thirty-right',
    props.params,
  );

  const isEmptyPlaceholder =
    isContainerPlaceholderEmpty(rendering, leftPlaceholders, left) &&
    isContainerPlaceholderEmpty(rendering, rightPlaceholders, right);

  if (isEmptyPlaceholder && !isPageEditing) {
    return null;
  }

  const excludeTopMargin =
    props?.params?.excludeTopMargin === '1' ? true : false;

  const rawStyles = props.params?.styles as string | undefined;
  const presentationStyles = stripContainer7030AlignTopStyle(rawStyles);
  const alignTop = hasContainer7030AlignTopStyle(rawStyles);

  return (
    <section
      className={cn('container--7030', 'mt-4', {
        'mt-0': excludeTopMargin,
        [presentationStyles]: Boolean(presentationStyles),
      })}
    >
      <Flex
        wrap="nowrap"
        align={alignTop ? e.FlexAlign.START : e.FlexAlign.CENTER}
      >
        <FlexItem as="div" basis="7/10">
          <AppPlaceholder
            name={leftPlaceholders.dynamicKey}
            rendering={rendering}
            page={page}
            componentMap={componentMap}
          />
        </FlexItem>
        <FlexItem as="div" basis="3/10">
          <AppPlaceholder
            name={rightPlaceholders.dynamicKey}
            rendering={rendering}
            page={page}
            componentMap={componentMap}
          />
        </FlexItem>
      </Flex>
    </section>
  );
};
