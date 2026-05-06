import type { ImageField } from '@sitecore-content-sdk/nextjs';
import type { TopicItemProps } from './topic-listing.props';

type ImageWrapperInput = TopicItemProps['image'];

/**
 * Edge / layout may return:
 * - `{ jsonValue: ImageField | string }` (GraphQL field wrapper)
 * - a bare `ImageField` (`value.src` on the root)
 * - double-nested `jsonValue.value` (some payloads)
 */
export function resolveTopicLinkImageForWrapper(
  wrapped?: ImageWrapperInput | (ImageField & Record<string, unknown>) | null
): ImageField | undefined {
  if (wrapped == null || typeof wrapped !== 'object') return undefined;

  if ('jsonValue' in wrapped && wrapped.jsonValue != null) {
    const inner = wrapped.jsonValue;
    if (typeof inner === 'string') {
      try {
        const parsed = JSON.parse(inner) as ImageField;
        return normalizeImageFieldShape(parsed);
      } catch {
        return undefined;
      }
    }
    if (typeof inner === 'object') {
      return normalizeImageFieldShape(
        inner as ImageField & { jsonValue?: { value?: ImageField['value'] } }
      );
    }
  }

  if ('value' in wrapped) {
    return normalizeImageFieldShape(wrapped as ImageField);
  }

  return undefined;
}

function normalizeImageFieldShape(
  field: ImageField & { jsonValue?: { value?: ImageField['value'] } }
): ImageField | undefined {
  const srcFromTop =
    field.value && typeof field.value === 'object'
      ? (field.value as { src?: unknown }).src
      : undefined;
  if (typeof srcFromTop === 'string' && srcFromTop.length > 0) {
    return field;
  }

  const nestedVal = field.jsonValue?.value;
  const srcNested =
    nestedVal && typeof nestedVal === 'object'
      ? (nestedVal as { src?: unknown }).src
      : undefined;
  if (typeof srcNested === 'string' && srcNested.length > 0) {
    return { ...field, value: nestedVal as ImageField['value'] };
  }

  const maybeEditable = field as ImageField & { editable?: string };
  if (maybeEditable.editable || (field.value && typeof field.value === 'object')) {
    return field;
  }

  return undefined;
}

export function topicItemImageWrapperInput(topic: TopicItemProps & Record<string, unknown>): ImageWrapperInput {
  const fromCamel = topic.image;
  const fromPascal = topic.Image as ImageWrapperInput | undefined;
  return fromCamel ?? fromPascal;
}
