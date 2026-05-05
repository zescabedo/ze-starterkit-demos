'use client';

import { useState } from 'react';
import {
  SecondaryNavigationPage,
  SecondaryNavigationProps,
} from '@/components/secondary-navigation/secondary-navigation.props';
import { Button } from '@/components/ui/button';
import NextLink from 'next/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { type JSX } from 'react';

export const Default: React.FC<SecondaryNavigationProps> = (props) => {
  const { fields } = props;
  const { datasource } = fields?.data ?? {};
  const { parent, children } = datasource ?? {};

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const renderChildren = (childItems: SecondaryNavigationPage[]) => {
    return (
      <NavigationMenu.List className="mt-2 flex list-none flex-col items-start gap-2">
        {childItems.map((child, index) => {
          const title =
            child.navigationTitle?.jsonValue.value ||
            child.title?.jsonValue.value ||
            child.displayName ||
            child.name;

          return (
            <NavigationMenu.Item key={index}>
              <Button asChild variant="link" className="font-bold">
                <NextLink href={child.url?.href || ''} className=" p-2">
                  {title}
                </NextLink>
              </Button>
            </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>
    );
  };

  const Content = (props: { className?: string }): JSX.Element => {
    const { className } = props;

    return (
      <NavigationMenu.Root
        className={cn('relative justify-center', className)}
        orientation="vertical"
      >
        <NavigationMenu.List className="m-0 flex list-none flex-col gap-2 pl-0">
          {parent.children?.results?.map((item, index) => {
            const isParent = datasource.id == item.id;
            const title =
              item.navigationTitle?.jsonValue.value ||
              item.title?.jsonValue.value ||
              item.displayName ||
              item.name;

            return (
              <NavigationMenu.Item key={index}>
                <Button asChild variant="link" className="justify-start">
                  <NextLink
                    href={item.url?.href || ''}
                    className="box-border inline-block w-full rounded-md p-2 px-4 font-bold hover:bg-secondary"
                  >
                    {title}
                  </NextLink>
                </Button>
                {isParent && renderChildren(children.results)}
              </NavigationMenu.Item>
            );
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>
    );
  };

  if (fields) {
    return (
      <>
        <Content className="hidden sm:block" />

        {/* Mobile Dropdown */}
        <div className="relative block sm:hidden">
          <button
            className={cn(
              'flex w-full items-center justify-between rounded-md border border-border bg-background p-2 px-4',
              { ['rounded-bl-none rounded-br-none']: isOpen }
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* <RxText></RxText> */}
            <ChevronDownIcon className={cn('transition-all', { ['rotate-180']: isOpen })} />
          </button>
          {isOpen && (
            <div className="absolute top-full flex w-full flex-col rounded-bl-md rounded-br-md border border-t-0 border-border bg-background">
              <Content />
            </div>
          )}
        </div>
      </>
    );
  }
  return <NoDataFallback componentName="Secondary Navigation" />;
};
