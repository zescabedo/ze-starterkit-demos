export type MemberDemoTier = 'bank' | 'partner' | 'academic';

/** Shared demo password for all simulated member accounts. */
export const DEMO_MEMBER_PASSWORD = 'demo';

const USER_TO_TIER: Record<string, MemberDemoTier> = {
  bankmember: 'bank',
  partnermember: 'partner',
  academicmember: 'academic',
};

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/\s+/g, '');
}

export function resolveDemoTier(username: string): MemberDemoTier | null {
  const key = normalizeUsername(username);
  return USER_TO_TIER[key] ?? null;
}

export function isValidDemoPassword(password: string): boolean {
  return password === DEMO_MEMBER_PASSWORD;
}

/** Non-member list price (simulated commerce / integration). */
export function getListPrice(): number {
  return 310;
}

/** Member price by tier (simulated integration). */
export function getMemberPrice(tier: MemberDemoTier): number {
  switch (tier) {
    case 'bank':
      return 210;
    case 'partner':
      return 240;
    case 'academic':
      return 190;
  }
}

/**
 * Percent saved vs list price when member pays less than list.
 * Returns null when savings cannot be computed meaningfully.
 */
export function computeSavingsPercent(listPrice: number, memberPrice: number): number | null {
  if (!Number.isFinite(listPrice) || listPrice <= 0) {
    return null;
  }
  if (!Number.isFinite(memberPrice) || memberPrice >= listPrice) {
    return null;
  }
  return Math.round((1 - memberPrice / listPrice) * 100);
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

/** Member row price shown before login (demo teaser — bank tier). */
export function getAnonymousTeaserMemberPrice(): number {
  return getMemberPrice('bank');
}

export function tierDisplayLabel(tier: MemberDemoTier): string {
  switch (tier) {
    case 'bank':
      return 'Bank member';
    case 'partner':
      return 'Partner Network member';
    case 'academic':
      return 'Academic member';
    default:
      return 'Member';
  }
}
