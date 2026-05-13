'use client';

import type React from 'react';
import { Text, RichText } from '@sitecore-content-sdk/nextjs';

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

import type { PricingDetailsProps } from './pricing-details.props';

export const Default: React.FC<PricingDetailsProps> = (props) => {
  const { fields, page } = props;
  const { isAuthenticated, memberTier, openSignInModal } = useSimulatedMemberAuth();
  const isEditing = page.mode.isEditing;

  const ds = fields?.data?.datasource;

  if (!ds) {
    return <NoDataFallback componentName="Pricing Details" />;
  }

  const {
    productTypeTitle,
    memberPriceLabel,
    nonMemberPriceLabel,
    savingsIntro,
    footnote,
  } = ds;

  const listPrice = getListPrice();
  const savingsPrefix = savingsIntro?.jsonValue?.value?.trim() || 'Save';

  const memberPrice =
    isAuthenticated && memberTier ? getMemberPrice(memberTier) : null;
  const memberSavingsPct =
    memberPrice != null ? computeSavingsPercent(listPrice, memberPrice) : null;

  const memberDisplay = memberPrice != null ? formatUsd(memberPrice) : '';

  return (
    <section
      className={cn('text-heading @container space-y-4 font-sans')}
      data-component="PricingDetails"
    >
      {(productTypeTitle?.jsonValue?.value || isEditing) && (
        <Text
          field={productTypeTitle?.jsonValue}
          tag="h2"
          className="text-2xl font-bold tracking-tight text-heading"
        />
      )}

      {isAuthenticated && memberTier ? (
        <div className="space-y-1">
          {(memberPriceLabel?.jsonValue?.value || isEditing) && (
            <p className="text-base font-semibold">
              <Text field={memberPriceLabel?.jsonValue} tag="span" />{' '}
              <span className="tabular-nums">{memberDisplay}</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground">{tierDisplayLabel(memberTier)} pricing</p>
          {memberSavingsPct != null && (
            <p className="text-base font-semibold text-destructive">
              {savingsPrefix} {memberSavingsPct}% as a member
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {isEditing && (
            <div className="space-y-1 border-b border-dashed border-border pb-2 text-xs text-muted-foreground">
              {(memberPriceLabel?.jsonValue?.value || isEditing) && (
                <p>
                  <span className="font-medium text-foreground">Member label (signed-in): </span>
                  <Text field={memberPriceLabel?.jsonValue} tag="span" />
                </p>
              )}
              {(savingsIntro?.jsonValue?.value || isEditing) && (
                <p>
                  <span className="font-medium text-foreground">Savings intro (signed-in): </span>
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
          <button
            type="button"
            onClick={() => openSignInModal()}
            className="text-left text-base font-semibold text-destructive underline decoration-destructive underline-offset-4 hover:opacity-90 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign in to see member pricing
          </button>
        </div>
      )}

      {(footnote?.jsonValue || isEditing) && (
        <div className="text-sm leading-relaxed text-muted-foreground">
          <RichText field={footnote?.jsonValue} />
        </div>
      )}
    </section>
  );
};
