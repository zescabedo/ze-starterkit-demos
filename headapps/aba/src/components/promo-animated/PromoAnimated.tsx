'use client';

import type React from 'react';
import { PromoAnimatedProps } from './promo-animated.props';
import { PromoAnimatedDefault } from './PromoAnimatedDefault.dev';
import { PromoAnimatedImageRight } from './PromoAnimatedImageRight.dev';
import { PromoAnimatedABAPromo } from './PromoAnimatedABAPromo.dev';
import { PromoAnimatedFullWidthBackground } from './PromoAnimatedFullWidthBackground.dev';

// Data source checks are done in the child components

// Default display of the component
export const Default: React.FC<PromoAnimatedProps> = (props) => {
  const isPageEditing = props.page.mode.isEditing;
  return <PromoAnimatedDefault {...props} isPageEditing={isPageEditing} />;
};

// Variants
export const ImageRight: React.FC<PromoAnimatedProps> = (props) => {
  const isPageEditing = props.page.mode.isEditing;
  return <PromoAnimatedImageRight {...props} isPageEditing={isPageEditing} />;
};

/** Headless variant item name: "ABA Promo" (serialized as `ABAPromo` or `abaPromo`) */
export const ABAPromo: React.FC<PromoAnimatedProps> = (props) => {
  const isPageEditing = props.page.mode.isEditing;
  return <PromoAnimatedABAPromo {...props} isPageEditing={isPageEditing} />;
};

export const abaPromo = ABAPromo;

/** Alternate `FieldNames` serializations from XM Cloud / authoring */
export const AbaPromo = ABAPromo;
export const ABA_Promo = ABAPromo;

/** Headless variant item name: "Full Width Background" — aliases are attached at runtime. */
export const FullWidthBackground: React.FC<PromoAnimatedProps> = (props) => {
  const isPageEditing = props.page.mode.isEditing;
  return <PromoAnimatedFullWidthBackground {...props} isPageEditing={isPageEditing} />;
};

export const fullWidthBackground = FullWidthBackground;
