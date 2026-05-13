import { applyTopicListingVariantAliases } from '@/lib/apply-topic-listing-variant-aliases';

describe('applyTopicListingVariantAliases', () => {
  it('maps Calendar variant GUID and display name to Calendar export', () => {
    const Calendar = () => null;
    const Default = () => null;
    const map = new Map<string, Record<string, unknown>>([
      ['TopicListing', { Default, Calendar }],
    ]);

    applyTopicListingVariantAliases(map as never);

    const topic = map.get('TopicListing')!;
    expect(topic.Calendar).toBe(Calendar);
    expect(topic['9bc4b2fa-1735-4685-b2e7-ecf55f0436f1']).toBe(Calendar);
    expect(topic['{9bc4b2fa-1735-4685-b2e7-ecf55f0436f1}']).toBe(Calendar);
    expect(topic.TopicListingCalendar).toBe(Calendar);
  });

  it('supports plain object component maps (non-Map)', () => {
    const Calendar = () => null;
    const Default = () => null;
    const map: Record<string, Record<string, unknown>> = {
      TopicListing: { Default, Calendar },
    };

    applyTopicListingVariantAliases(map);

    expect(map.TopicListing.TopicListingCalendar).toBe(Calendar);
  });

  it('no-ops when TopicListing is missing', () => {
    const map = new Map<string, Record<string, unknown>>();
    expect(() => applyTopicListingVariantAliases(map as never)).not.toThrow();
  });
});
