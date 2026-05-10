import {
  peopleRenderingStyleClasses,
  resolvePeopleImageOrientation,
} from '@/components/people/people-params';
import type { ComponentParams } from '@sitecore-content-sdk/nextjs';
import { Orientation } from '@/enumerations/Orientation.enum';

describe('peopleRenderingStyleClasses', () => {
  it('merges styles and Styles without duplicate tokens', () => {
    const params = {
      styles: 'indent-top position-center',
      Styles: 'indent-bottom',
    } as unknown as ComponentParams;
    expect(peopleRenderingStyleClasses(params).split(/\s+/).sort()).toEqual(
      ['indent-bottom', 'indent-top', 'position-center'].sort(),
    );
  });

  it('returns empty string when absent', () => {
    expect(peopleRenderingStyleClasses(undefined)).toBe('');
    expect(peopleRenderingStyleClasses({} as ComponentParams)).toBe('');
  });
});

describe('resolvePeopleImageOrientation', () => {
  it('defaults to image-right', () => {
    expect(resolvePeopleImageOrientation(undefined)).toBe('image-right');
    expect(resolvePeopleImageOrientation({} as ComponentParams)).toBe('image-right');
  });

  it('reads enum values', () => {
    expect(
      resolvePeopleImageOrientation({ orientation: Orientation.IMAGE_LEFT } as ComponentParams),
    ).toBe('image-left');
    expect(
      resolvePeopleImageOrientation({ orientation: Orientation.IMAGE_RIGHT } as ComponentParams),
    ).toBe('image-right');
  });

  it('reads Sitecore display labels', () => {
    expect(resolvePeopleImageOrientation({ orientation: 'Image Left' } as ComponentParams)).toBe(
      'image-left',
    );
    expect(resolvePeopleImageOrientation({ Orientation: 'Image Right' } as ComponentParams)).toBe(
      'image-right',
    );
  });
});
