import { defineConfig } from '@sitecore-content-sdk/nextjs/config';

/**
 * Content SDK / SitecoreClient configuration.
 * `api.edge.edgeUrl` must be the **Experience Edge GraphQL** host (typically
 * `https://edge-platform.sitecorecloud.io`), not your tenant `xmc-*.sitecorecloud.io` media host.
 * Root-relative media URLs are prefixed separately via `NEXT_PUBLIC_SITECORE_EDGE_MEDIA_ORIGIN`
 * in `src/lib/sitecore-image-src.ts`.
 *
 * @see https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecore-configuration-file.html
 */
const edgeTimeout = parseInt(process.env.PERSONALIZE_MIDDLEWARE_EDGE_TIMEOUT ?? '400', 10);
const cdpTimeout = parseInt(process.env.PERSONALIZE_MIDDLEWARE_CDP_TIMEOUT ?? '400', 10);

export default defineConfig({
  api: {
    edge: {
      contextId:
        process.env.SITECORE_EDGE_CONTEXT_ID ||
        process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ||
        '',
      clientContextId: process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID,
      edgeUrl:
        process.env.NEXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME?.trim() ||
        'https://edge-platform.sitecorecloud.io',
    },
    local: {
      apiKey: process.env.NEXT_PUBLIC_SITECORE_API_KEY || '',
      apiHost: process.env.NEXT_PUBLIC_SITECORE_API_HOST || '',
    },
  },
  defaultSite:
    process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME?.trim() ||
    process.env.NEXT_PUBLIC_SITECORE_SITE_NAME?.trim() ||
    'ABA',
  defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE?.trim() || 'en',
  editingSecret: process.env.SITECORE_EDITING_SECRET || '',
  redirects: {
    enabled: true,
    locales: ['en'],
  },
  multisite: {
    enabled: true,
    useCookieResolution: () => process.env.VERCEL_ENV === 'preview',
  },
  personalize: {
    scope: process.env.NEXT_PUBLIC_PERSONALIZE_SCOPE,
    edgeTimeout,
    cdpTimeout,
  },
});
