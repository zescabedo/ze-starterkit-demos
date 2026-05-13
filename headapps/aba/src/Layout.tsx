/**
 * This Layout is needed for Starter Kit.
 */
import React, { type JSX } from 'react';
import {
  Page,
  Field,
  ImageField,
  AppPlaceholder,
  DesignLibraryApp,
} from '@sitecore-content-sdk/nextjs';
import Scripts from 'src/Scripts';
import SitecoreStyles from 'components/content-sdk/SitecoreStyles';
import { Figtree } from 'next/font/google';
import componentMap from '@/lib/sitecore-component-map';

const heading = Figtree({
  weight: ['400', '500'],
  variable: '--font-heading',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

const body = Figtree({
  weight: ['400', '500'],
  variable: '--font-body',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});
interface LayoutProps {
  page: Page;
}

export interface RouteFields {
  [key: string]: unknown;
  Title?: Field;
  metadataTitle?: Field;
  metadataAuthor?: Field;
  metadataKeywords?: Field;
  pageTitle?: Field;
  metadataDescription?: Field;
  pageSummary?: Field;
  ogTitle?: Field;
  ogDescription?: Field;
  ogImage?: ImageField;
  thumbnailImage?: ImageField;
}

const Layout = ({ page }: LayoutProps): JSX.Element => {
  const { layout, mode } = page;
  const { route } = layout.sitecore;
  const mainClassPageEditing = mode.isEditing ? 'editing-mode' : 'prod-mode';
  const classNamesMain = `${mainClassPageEditing} ${body.variable} ${heading.variable} main-layout`;

  return (
    <>
      <Scripts />
      <SitecoreStyles layoutData={layout} />
      {/* Placeholders must stay under the single SitecoreProvider from page.tsx / not-found.
          Nesting another client Providers here crosses the RSC boundary and tries to serialize
          the server componentMap (functions), which breaks edit mode. */}
      <div className={`min-h-screen flex flex-col ${classNamesMain}`}>
        {mode.isDesignLibrary ? (
          route && (
            <DesignLibraryApp
              page={page}
              rendering={route}
              componentMap={componentMap}
              loadServerImportMap={() => import('.sitecore/import-map.server')}
            />
          )
        ) : (
          <>
            <header>
              <div id="header">
                {route && (
                  <AppPlaceholder
                    page={page}
                    componentMap={componentMap}
                    name="headless-header"
                    rendering={route}
                  />
                )}
              </div>
            </header>
            <main>
              <div id="content" className="antialiased">
                {route && (
                  <AppPlaceholder
                    page={page}
                    componentMap={componentMap}
                    name="headless-main"
                    rendering={route}
                  />
                )}
              </div>
            </main>
            <footer>
              <div id="footer">
                {route && (
                  <AppPlaceholder
                    page={page}
                    componentMap={componentMap}
                    name="headless-footer"
                    rendering={route}
                  />
                )}
              </div>
            </footer>
          </>
        )}
      </div>
    </>
  );
};

export default Layout;
