/**
 * Parses Sitecore Integer / GraphQL `jsonValue.value` for credit cost.
 * Returns null when the field is unset, empty, or not a finite number (hidden for live anonymous / empty).
 */
export function parseCreditCostFieldValue(raw: unknown): number | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '') {
      return null;
    }
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
