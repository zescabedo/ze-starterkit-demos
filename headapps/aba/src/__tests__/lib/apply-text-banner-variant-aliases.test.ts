import { applyTextBannerVariantAliases } from '@/lib/apply-text-banner-variant-aliases';

describe('applyTextBannerVariantAliases', () => {
  it('aliases spaced variant keys to GrayContentLeft', () => {
    const impl = () => null;
    const map = new Map([
      [
        'TextBanner',
        {
          Default: impl,
          GrayContentLeft: impl,
        },
      ],
    ]);

    applyTextBannerVariantAliases(map as never);

    const record = map.get('TextBanner') as Record<string, unknown>;
    expect(record['Gray Content Left']).toBe(impl);
    expect(record['19399b57-b7d8-4f80-b849-5ab81e8b2868']).toBe(impl);
  });

  it('no-ops when TextBanner is missing', () => {
    const map = new Map();
    expect(() => applyTextBannerVariantAliases(map as never)).not.toThrow();
  });
});
