import type { ComponentParams } from '@sitecore-content-sdk/nextjs';

/** Sitecore checkbox rendering parameters are stored as `"1"` when checked. */
export function isRenderingParamChecked(
  params: ComponentParams | undefined,
  ...keys: string[]
): boolean {
  if (!params) return false;
  return keys.some((key) => params[key] === '1' || params[key] === 'true');
}

/** Droplist value for Background Theme (matches Topic Listing enumeration). */
export function getBackgroundThemeParam(params: ComponentParams | undefined): string {
  if (!params) return '';
  const raw = params.backgroundTheme ?? params.BackgroundTheme ?? '';
  return typeof raw === 'string' ? raw.trim() : '';
}

export function isShootingStarBackground(params: ComponentParams | undefined): boolean {
  return getBackgroundThemeParam(params) === 'shooting-star';
}

export interface PricingDetailsRenderingFlags {
  backgroundTheme: string;
  hideTitle: boolean;
  hideCredits: boolean;
  hideFootnote: boolean;
  hideSavings: boolean;
  contentIsFree: boolean;
}

export function getPricingDetailsRenderingFlags(
  params: ComponentParams | undefined
): PricingDetailsRenderingFlags {
  return {
    backgroundTheme: getBackgroundThemeParam(params),
    hideTitle: isRenderingParamChecked(params, 'hideTitle', 'HideTitle'),
    hideCredits: isRenderingParamChecked(params, 'hideCredits', 'HideCredits'),
    hideFootnote: isRenderingParamChecked(params, 'hideFootnote', 'HideFootnote'),
    hideSavings: isRenderingParamChecked(params, 'hideSavings', 'HideSavings'),
    contentIsFree: isRenderingParamChecked(params, 'contentIsFree', 'ContentIsFree'),
  };
}
