import {
  computeSavingsPercent,
  DEMO_MEMBER_PASSWORD,
  formatUsd,
  getListPrice,
  getMemberPrice,
  isValidDemoPassword,
  resolveDemoTier,
} from '@/lib/member-pricing-demo';

describe('member-pricing-demo', () => {
  it('computeSavingsPercent rounds correctly', () => {
    expect(computeSavingsPercent(310, 210)).toBe(32);
    expect(computeSavingsPercent(100, 50)).toBe(50);
  });

  it('computeSavingsPercent returns null for invalid inputs', () => {
    expect(computeSavingsPercent(0, 10)).toBeNull();
    expect(computeSavingsPercent(100, 100)).toBeNull();
    expect(computeSavingsPercent(100, 120)).toBeNull();
  });

  it('resolveDemoTier maps demo usernames', () => {
    expect(resolveDemoTier('BankMember')).toBe('bank');
    expect(resolveDemoTier('partnermember')).toBe('partner');
    expect(resolveDemoTier(' AcademicMember ')).toBe('academic');
    expect(resolveDemoTier('unknown')).toBeNull();
  });

  it('isValidDemoPassword accepts shared password', () => {
    expect(isValidDemoPassword(DEMO_MEMBER_PASSWORD)).toBe(true);
    expect(isValidDemoPassword('wrong')).toBe(false);
  });

  it('getListPrice and getMemberPrice return demo constants', () => {
    expect(getListPrice()).toBe(310);
    expect(getMemberPrice('bank')).toBe(210);
    expect(getMemberPrice('partner')).toBe(240);
    expect(getMemberPrice('academic')).toBe(190);
  });

  it('formatUsd formats en-US currency', () => {
    expect(formatUsd(210)).toMatch(/\$210/);
  });
});
