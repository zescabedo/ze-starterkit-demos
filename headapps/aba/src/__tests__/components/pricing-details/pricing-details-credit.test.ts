import { parseCreditCostFieldValue } from '@/components/pricing-details/pricing-details-credit';

describe('parseCreditCostFieldValue', () => {
  it('returns null for empty / invalid', () => {
    expect(parseCreditCostFieldValue(null)).toBeNull();
    expect(parseCreditCostFieldValue(undefined)).toBeNull();
    expect(parseCreditCostFieldValue('')).toBeNull();
    expect(parseCreditCostFieldValue('   ')).toBeNull();
    expect(parseCreditCostFieldValue('x')).toBeNull();
    expect(parseCreditCostFieldValue(Number.NaN)).toBeNull();
    expect(parseCreditCostFieldValue(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('parses finite numbers and numeric strings', () => {
    expect(parseCreditCostFieldValue(0)).toBe(0);
    expect(parseCreditCostFieldValue(42)).toBe(42);
    expect(parseCreditCostFieldValue(' 7 ')).toBe(7);
  });
});
