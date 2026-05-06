import type { LinkField } from '@sitecore-content-sdk/nextjs';
import {
  mergeTextBannerFieldRecord,
  normalizeLinkFieldForRendering,
  pickCategoryRawField,
} from '@/components/text-banner/text-banner-field-utils';

describe('text-banner-field-utils', () => {
  it('normalizeLinkFieldForRendering fills value from jsonValue.value', () => {
    const raw = {
      value: {} as LinkField['value'],
      jsonValue: {
        value: {
          href: '/fraud',
          text: 'Fraud Prevention',
          linktype: 'internal',
        },
      },
    };
    const out = normalizeLinkFieldForRendering(raw);
    expect(out?.value?.href).toBe('/fraud');
    expect(out?.value?.text).toBe('Fraud Prevention');
  });

  it('mergeTextBannerFieldRecord flattens data.datasource', () => {
    const merged = mergeTextBannerFieldRecord({
      heading: { value: 'Hi' },
      data: {
        datasource: {
          Category1: {
            jsonValue: {
              value: { href: '/x', text: 'X', linktype: 'internal' },
            },
          },
        },
      },
    });
    expect(merged.heading).toEqual({ value: 'Hi' });
    const c1 = pickCategoryRawField(merged, 1);
    expect(normalizeLinkFieldForRendering(c1)?.value?.text).toBe('X');
  });

  it('pickCategoryRawField matches canonical category1 keys', () => {
    const merged = { 'category 1': { value: 'Label' } };
    expect(pickCategoryRawField(merged, 1)).toEqual({ value: 'Label' });
  });
});
