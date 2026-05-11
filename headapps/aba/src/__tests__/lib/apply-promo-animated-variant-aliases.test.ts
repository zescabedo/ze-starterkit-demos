import { applyPromoAnimatedVariantAliases } from '@/lib/apply-promo-animated-variant-aliases';

describe('applyPromoAnimatedVariantAliases', () => {
  it('adds ABA Promo and GUID keys when ABAPromo exists', () => {
    const impl = () => null;
    const promoEntry = { Default: () => null, ImageRight: () => null, ABAPromo: impl };
    const map = new Map<string, typeof promoEntry>([['PromoAnimated', promoEntry]]);

    applyPromoAnimatedVariantAliases(map as never);

    const promo = map.get('PromoAnimated') as Record<string, unknown>;
    expect(promo['ABA Promo']).toBe(impl);
    expect(promo['8777bbb3-8528-4ffe-85fe-20b0eb55e331']).toBe(impl);
    expect(promo['{8777bbb3-8528-4ffe-85fe-20b0eb55e331}']).toBe(impl);
    expect(promo.AbaPromo).toBe(impl);
    expect(promo.ABA_Promo).toBe(impl);
    expect(promo.PromoAnimatedABAPromo).toBe(impl);
  });

  it('adds Full Width Background and GUID keys when FullWidthBackground exists', () => {
    const impl = () => null;
    const promoEntry = {
      Default: () => null,
      ImageRight: () => null,
      FullWidthBackground: impl,
    };
    const map = new Map<string, typeof promoEntry>([['PromoAnimated', promoEntry]]);

    applyPromoAnimatedVariantAliases(map as never);

    const promo = map.get('PromoAnimated') as Record<string, unknown>;
    expect(promo['Full Width Background']).toBe(impl);
    expect(promo['d5a4329e-6aea-402f-979e-7aa27b535447']).toBe(impl);
    expect(promo['{d5a4329e-6aea-402f-979e-7aa27b535447}']).toBe(impl);
    expect(promo.Full_Width_Background).toBe(impl);
    expect(promo.PromoAnimatedFullWidthBackground).toBe(impl);
  });

  it('falls back to camelCase variant export when PascalCase is missing', () => {
    const impl = () => null;
    const promoEntry = { Default: () => null, fullWidthBackground: impl };
    const map = new Map<string, typeof promoEntry>([['PromoAnimated', promoEntry]]);

    applyPromoAnimatedVariantAliases(map as never);

    const promo = map.get('PromoAnimated') as Record<string, unknown>;
    expect(promo['Full Width Background']).toBe(impl);
    expect(promo.PromoAnimatedFullWidthBackground).toBe(impl);
  });

  it('is a no-op when PromoAnimated is missing', () => {
    const map = new Map<string, Record<string, unknown>>();
    expect(() => applyPromoAnimatedVariantAliases(map as never)).not.toThrow();
  });
});
