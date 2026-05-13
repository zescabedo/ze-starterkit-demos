import {
  classifyEventType,
  formatEventDateLabel,
  partitionFeatured,
  rowRenderable,
  topicRowsFromChildren,
} from '@/components/topic-listing/topic-listing-event-model';

describe('topic-listing-event-model', () => {
  it('classifies event types by label', () => {
    expect(classifyEventType('Webinar')).toBe('webinar');
    expect(classifyEventType('Annual Conference')).toBe('conference');
    expect(classifyEventType('AML Training')).toBe('training');
    expect(classifyEventType('Workshop Series')).toBe('workshop');
    expect(classifyEventType('Meetup')).toBe('default');
  });

  it('formats date in Eastern timezone', () => {
    const d = new Date('2026-05-12T18:30:00.000Z');
    const s = formatEventDateLabel(d);
    expect(s).toMatch(/May 12, 2026/);
  });

  it('partitions featured rows', () => {
    const rows = topicRowsFromChildren(
      [
        {
          eventTitle: { jsonValue: { value: 'A' } },
          eventType: { jsonValue: { value: 'Webinar' } },
          featured: { jsonValue: { value: true } },
          dateAndTime: { jsonValue: { value: '2026-05-10T14:00:00Z' } },
        },
        {
          eventTitle: { jsonValue: { value: 'B' } },
          eventType: { jsonValue: { value: 'Webinar' } },
          featured: { jsonValue: { value: false } },
          dateAndTime: { jsonValue: { value: '2026-05-11T14:00:00Z' } },
        },
      ],
      false,
    );
    const { featured, rest } = partitionFeatured(rows);
    expect(featured).toHaveLength(1);
    expect(featured[0]?.displayTitle).toBe('A');
    expect(rest).toHaveLength(1);
    expect(rest[0]?.displayTitle).toBe('B');
  });

  it('reads Sitecore template fields nested under `field` (Topic Link / Headless)', () => {
    const rows = topicRowsFromChildren(
      [
        {
          field: {
            Title: { jsonValue: { value: 'Regions bank' } },
            EventDescription: { jsonValue: { value: 'ABA continues to deliver exceptional education.' } },
            DateAndTime: { jsonValue: { value: '2026-05-13T14:00:00Z' } },
            Location: { jsonValue: { value: 'Virtual' } },
            EventType: { jsonValue: { value: 'Training' } },
            Featured: { jsonValue: { value: false } },
            ButtonLink: {
              jsonValue: { value: { href: 'https://example.com/register', text: 'Register' } },
            },
          },
        },
      ],
      false,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.displayTitle).toBe('Regions bank');
    expect(rows[0]?.displayDescription).toContain('ABA continues');
    expect(rows[0]?.eventTypeKey).toBe('training');
    expect(rows[0]?.isVirtual).toBe(true);
    expect(rows[0]?.cta?.value?.href).toBe('https://example.com/register');
  });

  it('hoists EventName section nested under `field.eventName` (Headless grouping)', () => {
    const rows = topicRowsFromChildren(
      [
        {
          field: {
            linkOptional: {
              jsonValue: {
                value: { href: '/', text: 'Link text should not replace event title' },
              },
            },
            eventName: {
              Title: { jsonValue: { value: 'Risk and Compliance Conference' } },
              EventDescription: { jsonValue: { value: 'Short description' } },
              DateAndTime: { jsonValue: { value: '2026-05-18T19:30:00.000Z' } },
              Location: { jsonValue: { value: 'Dallas, Texas' } },
              EventType: { jsonValue: { value: 'Webinar' } },
              Featured: { jsonValue: { value: true } },
            },
          },
        },
      ],
      false,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.displayTitle).toBe('Risk and Compliance Conference');
    expect(rows[0]?.displayDescription).toBe('Short description');
    expect(rows[0]?.eventTypeKey).toBe('webinar');
    expect(rows[0]?.featured).toBe(true);
    expect(rows[0]?.location).toBe('Dallas, Texas');
    expect(rows[0]?.at).not.toBeNull();
  });

  it('parses Sitecore compact datetime in jsonValue.value', () => {
    const rows = topicRowsFromChildren(
      [
        {
          Title: { jsonValue: { value: 'Compact date' } },
          DateAndTime: { jsonValue: { value: '20260518T143000Z' } },
          EventType: { jsonValue: { value: 'Training' } },
        },
      ],
      false,
    );
    expect(rows[0]?.at).not.toBeNull();
    expect(rows[0]?.displayTitle).toBe('Compact date');
  });

  it('reads flat TopicListing ComponentQuery child shape (EventName fields as top-level aliases)', () => {
    const rows = topicRowsFromChildren(
      [
        {
          link: {
            jsonValue: { value: { href: 'https://aba.example/', text: 'Fallback link text' } },
          },
          eventTitle: { jsonValue: { value: 'Risk and Compliance Conference' } },
          eventDescription: { jsonValue: { value: 'Write a short description about the event' } },
          dateAndTime: { jsonValue: { value: '20260518T143000Z' } },
          location: { jsonValue: { value: 'Dallas, Texas' } },
          eventType: { jsonValue: { value: 'Webinar' } },
          buttonLink: { jsonValue: { value: { href: 'https://register.example/', text: 'Register' } } },
          featured: { jsonValue: { value: true } },
        },
      ],
      false,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.displayTitle).toBe('Risk and Compliance Conference');
    expect(rows[0]?.displayDescription).toContain('short description');
    expect(rows[0]?.eventTypeKey).toBe('webinar');
    expect(rows[0]?.location).toBe('Dallas, Texas');
    expect(rows[0]?.featured).toBe(true);
    expect(rows[0]?.cta?.value?.href).toBe('https://register.example/');
    expect(rows[0]?.at).not.toBeNull();
  });

  it('merges `fields` array entries (Edge-style) onto calendar rows', () => {
    const rows = topicRowsFromChildren(
      [
        {
          fields: [
            { name: 'Title', jsonValue: { value: 'From fields array' } },
            { name: 'DateAndTime', jsonValue: { value: '2026-06-01T12:00:00.000Z' } },
            { name: 'EventType', jsonValue: { value: 'Workshop' } },
          ],
        },
      ],
      false,
    );
    expect(rows[0]?.displayTitle).toBe('From fields array');
    expect(rows[0]?.at).not.toBeNull();
    expect(rows[0]?.eventTypeKey).toBe('workshop');
  });

  it('matches EventTitle / title keys via canonical field pick', () => {
    const rows = topicRowsFromChildren(
      [
        {
          EventTitle: { jsonValue: { value: 'Canonical pick title' } },
          dateAndTime: { jsonValue: { value: '2026-07-04T10:00:00.000Z' } },
        },
      ],
      false,
    );
    expect(rows[0]?.displayTitle).toBe('Canonical pick title');
  });

  it('uses Sitecore item `name` when event title fields are absent', () => {
    const raw = { name: 'Risk and Compliance Conference', link: { jsonValue: { value: { href: '', text: '' } } } };
    const rows = topicRowsFromChildren([raw], false);
    expect(rows[0]?.displayTitle).toBe('Risk and Compliance Conference');
  });

  it('uses link jsonValue text when normalize does not surface top-level value (Home-style Topic Links)', () => {
    const rows = topicRowsFromChildren(
      [
        {
          name: 'Topic Link 1',
          link: {
            jsonValue: {
              value: {
                href: '/article-sites/aba/Articles/Article 1',
                text: 'Training & Events',
              },
            },
          },
        },
      ],
      false,
    );
    expect(rows[0]?.displayTitle).toBe('Training & Events');
    expect(rowRenderable(rows[0]!, false)).toBe(true);
  });

  it('rowRenderable keeps rows that only have location (partial Edge payloads)', () => {
    expect(
      rowRenderable(
        {
          key: '1',
          displayTitle: '',
          displayDescription: '',
          at: null,
          eventTypeLabel: 'Event',
          eventTypeKey: 'default',
          location: 'Dallas, Texas',
          isVirtual: false,
          featured: false,
          raw: {} as never,
        },
        false,
      ),
    ).toBe(true);
  });
});
