import { defineCliConfig } from '@sitecore-content-sdk/nextjs/config-cli';
import {
  generateSites,
  generateMetadata,
  extractFiles,
  writeImportMap,
} from '@sitecore-content-sdk/nextjs/tools';
import scConfig from './sitecore.config';

export default defineCliConfig({
  config: scConfig,
  build: {
    commands: [
      generateMetadata(),
      generateSites(),
      extractFiles(),
      writeImportMap({
        paths: ['src/components'],
      }),
    ],
  },
  componentMap: {
    paths: ['src/components'],
    exclude: [
      'src/components/content-sdk/*',
      'src/components/ui/*',
      /**
       * Helpers / props / context must NOT be registered as Sitecore components.
       * The generator otherwise spreads their exports into the map (including functions),
       * which breaks Next.js RSC + edit mode (“Functions cannot be passed to Client Components”).
       */
      'src/components/container/container.util.ts',
      'src/components/topic-listing/TopicListingCalendarShell.tsx',
      'src/components/**/*.props.ts',
      'src/components/**/*.props.tsx',
      'src/components/**/*field-utils.ts',
      'src/components/**/*-event-model.ts',
      'src/components/**/people-params.ts',
      'src/components/**/topic-link-image.ts',
      'src/components/**/promo-animated.util.ts',
      'src/components/video/video-props.tsx',
      'src/components/image/image-optimization.context.tsx',
      'src/components/**/*.dictionary.ts',
    ],
  },
});
