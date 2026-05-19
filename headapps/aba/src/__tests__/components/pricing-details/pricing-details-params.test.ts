import {
  getPricingDetailsRenderingFlags,
  isRenderingParamChecked,
  isShootingStarBackground,
} from '@/components/pricing-details/pricing-details-params';

describe('pricing-details-params', () => {
  it('treats checkbox params as checked when value is 1', () => {
    expect(isRenderingParamChecked({ HideTitle: '1' }, 'hideTitle', 'HideTitle')).toBe(true);
    expect(isRenderingParamChecked({ hideTitle: '1' }, 'hideTitle', 'HideTitle')).toBe(true);
    expect(isRenderingParamChecked({ HideTitle: '0' }, 'hideTitle', 'HideTitle')).toBe(false);
  });

  it('reads background theme from camelCase or PascalCase keys', () => {
    expect(isShootingStarBackground({ backgroundTheme: 'shooting-star' })).toBe(true);
    expect(isShootingStarBackground({ BackgroundTheme: 'shooting-star' })).toBe(true);
    expect(isShootingStarBackground({ BackgroundTheme: 'default' })).toBe(false);
  });

  it('parses all rendering flags', () => {
    expect(
      getPricingDetailsRenderingFlags({
        BackgroundTheme: 'shooting-star',
        ContentIsFree: '1',
        HideCredits: '1',
      })
    ).toEqual({
      backgroundTheme: 'shooting-star',
      hideTitle: false,
      hideCredits: true,
      hideFootnote: false,
      hideSavings: false,
      contentIsFree: true,
    });
  });
});
