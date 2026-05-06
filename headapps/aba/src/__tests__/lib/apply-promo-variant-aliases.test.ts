import { applyPromoVariantAliases } from '@/lib/apply-promo-variant-aliases';

describe('applyPromoVariantAliases', () => {
  it('adds spaced name and GUID keys when NoImageCompressed exists', () => {
    const impl = () => null;
    const promoEntry = { Default: () => null, WithText: () => null, NoImageCompressed: impl };
    const map = new Map<string, typeof promoEntry>([['Promo', promoEntry]]);

    applyPromoVariantAliases(map as never);

    const promo = map.get('Promo') as Record<string, unknown>;
    expect(promo['No Image Compressed']).toBe(impl);
    expect(promo['31c589fe-ccd1-4bf9-89f3-352715618792']).toBe(impl);
    expect(promo['{31c589fe-ccd1-4bf9-89f3-352715618792}']).toBe(impl);
    expect(promo.No_Image_Compressed).toBe(impl);
    expect(promo.no_image_compressed).toBe(impl);
  });

  it('falls back to noImageCompressed export name', () => {
    const impl = () => null;
    const promoEntry = { Default: () => null, noImageCompressed: impl };
    const map = new Map<string, typeof promoEntry>([['Promo', promoEntry]]);

    applyPromoVariantAliases(map as never);

    const promo = map.get('Promo') as Record<string, unknown>;
    expect(promo['No Image Compressed']).toBe(impl);
  });

  it('is a no-op when Promo is missing', () => {
    const map = new Map<string, Record<string, unknown>>();
    expect(() => applyPromoVariantAliases(map as never)).not.toThrow();
  });
});
