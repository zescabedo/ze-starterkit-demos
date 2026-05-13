import type React from 'react';
import { ImageWrapperClient } from './ImageWrapper.client';
import type { ImageWrapperProps } from './ImageWrapper.client';

/**
 * Server component wrapper for ImageWrapper. Delegates to ImageWrapperClient for
 * client-only behavior (editing mode, in-view, optimization context).
 *
 * AppPlaceholder injects non-serializable props (e.g. `componentMap`) onto every
 * rendering — never forward the full props object into a Client Component.
 */
export const Default: React.FC<ImageWrapperProps> = (props) => {
  const { image, className, priority, sizes, blurDataURL, alt, wrapperClass } = props;
  return (
    <ImageWrapperClient
      image={image}
      className={className}
      priority={priority}
      sizes={sizes}
      blurDataURL={blurDataURL}
      alt={alt}
      wrapperClass={wrapperClass}
    />
  );
};
