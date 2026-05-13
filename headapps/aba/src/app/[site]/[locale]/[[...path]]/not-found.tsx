import Link from 'next/link';
import { ErrorPage, getCachedPageParams } from '@sitecore-content-sdk/nextjs';
import client from 'lib/sitecore-client';
import scConfig from 'sitecore.config';
import Layout from 'src/Layout';
import Providers from 'src/Providers';
import { getLocale, getMessages, setRequestLocale } from 'next-intl/server';

export default async function NotFound() {
  const { site, locale } = getCachedPageParams();
  const resolvedSite = site || scConfig.defaultSite;
  const resolvedLocale = locale || scConfig.defaultLanguage;
  setRequestLocale(`${resolvedSite}_${resolvedLocale}`);

  try {
    const page = await client.getErrorPage(ErrorPage.NotFound, {
      site: resolvedSite,
      locale: resolvedLocale,
    });

    if (page) {
      const [intlMessages, intlLocale] = await Promise.all([getMessages(), getLocale()]);

      return (
        <Providers page={page} intlLocale={intlLocale} intlMessages={intlMessages}>
          <Layout page={page} />
        </Providers>
      );
    }
  } catch (error) {
    console.error('Error fetching 404 page:', error);
  }

  return (
    <div style={{ padding: 10 }}>
      <h1>Page not found</h1>
      <p>This page does not exist.</p>
      <Link href="/">Go to the Home page</Link>
    </div>
  );
}
