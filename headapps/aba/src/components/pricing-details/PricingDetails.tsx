'use client';

import type React from 'react';
import { Text, RichText } from '@sitecore-content-sdk/nextjs';

import { Meteors } from '@/components/magicui/meteors';
import { useSimulatedMemberAuth } from '@/contexts/SimulatedMemberAuthContext';
import {
  computeSavingsPercent,
  formatUsd,
  getListPrice,
  getMemberPrice,
  tierDisplayLabel,
} from '@/lib/member-pricing-demo';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { cn } from '@/lib/utils';

import { parseCreditCostFieldValue } from './pricing-details-credit';
import {
  getPricingDetailsRenderingFlags,
  isShootingStarBackground,
} from './pricing-details-params';
import type { PricingDetailsProps } from './pricing-details.props';

const SHOOTING_STAR_METEOR_STYLE = {
  '--meteor-color': '255, 255, 255',
  '--meteor-opacity': '0.6',
} as React.CSSProperties;

export const Default: React.FC<PricingDetailsProps> = (props) => {
  const { fields, page, params } = props;
  const { isAuthenticated, memberTier, openSignInModal } = useSimulatedMemberAuth();
  const isEditing = page.mode.isEditing;
  const flags = getPricingDetailsRenderingFlags(params);
  const isShootingStar = isShootingStarBackground(params);

  const ds = fields?.data?.datasource;

  if (!ds) {
    return <NoDataFallback componentName="Pricing Details" />;
  }

  const {
    productTypeTitle,
    memberPriceLabel,
    nonMemberPriceLabel,
    savingsIntro,
    creditCost,
    footnote,
  } = ds;

  const parsedCreditCost = parseCreditCostFieldValue(creditCost?.jsonValue?.value);
  const hasParsedCreditCost = parsedCreditCost !== null;
  const showCreditCostRow =
    !flags.hideCredits &&
    hasParsedCreditCost &&
    (flags.contentIsFree || isEditing || (isAuthenticated && memberTier != null));

  const listPrice = getListPrice();
  const savingsPrefix = savingsIntro?.jsonValue?.value?.trim() || 'Save';

  const memberPrice =
    !flags.contentIsFree && isAuthenticated && memberTier
      ? getMemberPrice(memberTier)
      : null;
  const memberSavingsPct =
    memberPrice != null ? computeSavingsPercent(listPrice, memberPrice) : null;

  const memberDisplay = memberPrice != null ? formatUsd(memberPrice) : '';

  const mutedTextClass = isShootingStar ? 'text-white/80' : 'text-muted-foreground';
  const savingsTextClass = isShootingStar
    ? 'text-base font-semibold text-white'
    : 'text-base font-semibold text-destructive';
  const signInButtonClass = cn(
    'text-left text-base font-semibold underline underline-offset-4 hover:opacity-90 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    isShootingStar
      ? 'text-white decoration-white'
      : 'text-destructive decoration-destructive'
  );
  const eeAuthoringStripClass = cn(
    'space-y-1 border-b border-dashed pb-2 text-xs',
    isShootingStar
      ? 'border-white/30 text-white/80'
      : 'border-border text-muted-foreground'
  );
  const eeLabelClass = isShootingStar ? 'font-medium text-white' : 'font-medium text-foreground';

  const pricingBlock = flags.contentIsFree ? (
    <p className="text-base font-semibold">
      <span className="tabular-nums">Free</span>
    </p>
  ) : isAuthenticated && memberTier ? (
    <div className="space-y-1">
      {(memberPriceLabel?.jsonValue?.value || isEditing) && (
        <p className="text-base font-semibold">
          <Text field={memberPriceLabel?.jsonValue} tag="span" />{' '}
          <span className="tabular-nums">{memberDisplay}</span>
        </p>
      )}
      <p className={cn('text-sm', mutedTextClass)}>{tierDisplayLabel(memberTier)} pricing</p>
      {!flags.hideSavings && memberSavingsPct != null && (
        <p className={savingsTextClass}>
          {savingsPrefix} {memberSavingsPct}% as a member
        </p>
      )}
    </div>
  ) : (
    <div className="space-y-2">
      {isEditing && (
        <div className={eeAuthoringStripClass}>
          {(memberPriceLabel?.jsonValue?.value || isEditing) && (
            <p>
              <span className={eeLabelClass}>Member label (signed-in): </span>
              <Text field={memberPriceLabel?.jsonValue} tag="span" />
            </p>
          )}
          {(savingsIntro?.jsonValue?.value || isEditing) && (
            <p>
              <span className={eeLabelClass}>Savings intro (signed-in): </span>
              <Text field={savingsIntro?.jsonValue} tag="span" />
            </p>
          )}
        </div>
      )}
      {(nonMemberPriceLabel?.jsonValue?.value || isEditing) && (
        <p className="text-base font-semibold">
          <Text field={nonMemberPriceLabel?.jsonValue} tag="span" />{' '}
          <span className="tabular-nums">{formatUsd(listPrice)}</span>
        </p>
      )}
      <button type="button" onClick={() => openSignInModal()} className={signInButtonClass}>
        Sign in to see member pricing
      </button>
    </div>
  );

  return (
    <section
      className={cn(
        '@container space-y-4 font-sans',
        isShootingStar
          ? 'bg-primary text-white relative overflow-hidden'
          : 'text-heading'
      )}
      data-component="PricingDetails"
    >
      {isShootingStar && (
        <div
          className="absolute inset-0 z-10"
          style={SHOOTING_STAR_METEOR_STYLE}
          data-testid="pricing-shooting-star-meteors"
        >
          <Meteors
            number={40}
            minDelay={0.2}
            maxDelay={1.5}
            minDuration={18}
            maxDuration={38}
            angle={310}
            size="3"
          />
        </div>
      )}
      <div
        className={cn(
          'space-y-4',
          isShootingStar && 'relative z-20 px-5 py-5 text-white [&_a]:text-white'
        )}
      >
        {!flags.hideTitle && (productTypeTitle?.jsonValue?.value || isEditing) && (
          <Text
            field={productTypeTitle?.jsonValue}
            tag="h2"
            className={cn(
              'text-2xl font-bold tracking-tight',
              isShootingStar ? 'text-white' : 'text-heading'
            )}
          />
        )}

        {pricingBlock}

        {showCreditCostRow && (
          <div className="text-sm" data-testid="pricing-credit-cost">
            {isEditing ? (
              <p className="leading-relaxed">
                <span className={cn('font-medium', isShootingStar ? 'text-white' : 'text-foreground')}>
                  Credits{' '}
                </span>
                <Text
                  field={creditCost?.jsonValue}
                  tag="span"
                  className={cn('tabular-nums', isShootingStar ? 'text-white/80' : 'text-muted-foreground')}
                />
              </p>
            ) : (
              <p className={cn('leading-relaxed', isShootingStar ? 'text-white' : 'text-muted-foreground')}>
                <span className={cn('font-medium', isShootingStar ? 'text-white' : 'text-foreground')}>
                  Credits{' '}
                </span>
                <span className="tabular-nums">{parsedCreditCost}</span>
              </p>
            )}
          </div>
        )}

        {!flags.hideFootnote && (footnote?.jsonValue || isEditing) && (
          <div
            className={cn(
              'text-sm leading-relaxed [&_p]:text-inherit',
              isShootingStar ? 'text-white' : 'text-muted-foreground'
            )}
          >
            <RichText field={footnote?.jsonValue} />
          </div>
        )}
      </div>
    </section>
  );
};
