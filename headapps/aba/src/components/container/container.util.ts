import { ComponentParams, ComponentRendering } from '@sitecore-content-sdk/nextjs';
import type { JSX } from 'react';

type ContainerPlaceHolderProps = {
  dynamicKey: string;
  genericKey: string;
  fragment: string;
};

export const getContainerPlaceholderProps = (
  fragment: string,
  params: ComponentParams
): ContainerPlaceHolderProps => {
  const model: ContainerPlaceHolderProps = {
    dynamicKey: `${fragment}-${params.DynamicPlaceholderId}`,
    genericKey: `${fragment}-{*}`,
    fragment: fragment,
  };
  return model;
};

export const isContainerPlaceholderEmpty = (
  rendering: ComponentRendering,
  placeholderProps: ContainerPlaceHolderProps,
  children: JSX.Element | undefined
): boolean => {
  return (
    !(
      rendering?.placeholders?.[placeholderProps.dynamicKey] ||
      rendering?.placeholders?.[placeholderProps.genericKey]
    ) && !children
  );
};

/** Matches Sitecore style "Value" for Container 70/30 — see Presentation/Styles/Container/Align Top */
const ALIGN_TOP_PRESENTATION_STYLE = /(^|\s)Align\s+Top(\s|$)/i;

export function hasContainer7030AlignTopStyle(styles: string | undefined): boolean {
  const trimmed = styles?.trim();
  if (!trimmed) return false;
  return ALIGN_TOP_PRESENTATION_STYLE.test(trimmed);
}

/** Removes the presentation-only token so it is not emitted as stray CSS class names */
export function stripContainer7030AlignTopStyle(styles: string | undefined): string {
  const trimmed = styles?.trim();
  if (!trimmed) return '';
  return trimmed.replace(ALIGN_TOP_PRESENTATION_STYLE, ' ').replace(/\s+/g, ' ').trim();
}
