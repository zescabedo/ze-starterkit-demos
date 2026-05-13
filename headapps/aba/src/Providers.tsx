'use client';

import React from 'react';
import {
  ComponentPropsCollection,
  ComponentPropsContext,
  Page,
  SitecoreProvider,
} from '@sitecore-content-sdk/nextjs';
import type { AbstractIntlMessages } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import scConfig from 'sitecore.config';
import components from '@/lib/sitecore-component-map.client';
import { ThemeProvider } from 'components/theme-provider/theme-provider.dev';
import { VideoProvider } from './contexts/VideoContext';
import { SimulatedMemberAuthProvider } from './contexts/SimulatedMemberAuthContext';

export default function Providers({
  children,
  page,
  componentProps = {},
  intlLocale,
  intlMessages,
}: {
  children: React.ReactNode;
  page: Page;
  componentProps?: ComponentPropsCollection;
  /** When set with intlMessages, wraps children inside SitecoreProvider so intl is not above the Sitecore tree (avoids RSC serializing component maps). */
  intlLocale?: string;
  intlMessages?: AbstractIntlMessages;
}) {
  const intlInner = (
    <ComponentPropsContext value={componentProps}>
      <SimulatedMemberAuthProvider>
        <VideoProvider>
          <ThemeProvider attribute="class" disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </VideoProvider>
      </SimulatedMemberAuthProvider>
    </ComponentPropsContext>
  );

  return (
    <SitecoreProvider
      api={scConfig.api}
      componentMap={components}
      page={page}
      loadImportMap={() => import('.sitecore/import-map.client')}
    >
      {intlLocale != null && intlMessages != null ? (
        <NextIntlClientProvider locale={intlLocale} messages={intlMessages}>
          {intlInner}
        </NextIntlClientProvider>
      ) : (
        intlInner
      )}
    </SitecoreProvider>
  );
}
