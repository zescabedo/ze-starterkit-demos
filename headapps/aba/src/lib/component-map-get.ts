import type { NextjsContentSdkComponent } from '@sitecore-content-sdk/nextjs';

/** Generated component map may be a `Map` or a plain record depending on tooling / Jest resolution. */
export type ComponentMapLike = Map<string, NextjsContentSdkComponent> | Record<string, NextjsContentSdkComponent>;

export function getComponentMapEntry(
  map: ComponentMapLike,
  key: string
): NextjsContentSdkComponent | undefined {
  if (map instanceof Map) {
    return map.get(key);
  }
  return map[key];
}
