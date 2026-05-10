import { applyPeopleVariantAliases } from '@/lib/apply-people-variant-aliases';

describe('applyPeopleVariantAliases', () => {
  it('adds No Image and GUID keys when NoImage exists', () => {
    const impl = () => null;
    const peopleEntry = { Default: () => null, NoImage: impl };
    const map = new Map<string, typeof peopleEntry>([['People', peopleEntry]]);

    applyPeopleVariantAliases(map as never);

    const people = map.get('People') as Record<string, unknown>;
    expect(people['No Image']).toBe(impl);
    expect(people['{9ad4d22a-aefd-4d26-af3d-c5e0a444aee4}']).toBe(impl);
    expect(people['9ad4d22a-aefd-4d26-af3d-c5e0a444aee4']).toBe(impl);
  });

  it('is a no-op when People is missing', () => {
    const map = new Map<string, { Default: () => null }>();
    expect(() => applyPeopleVariantAliases(map as never)).not.toThrow();
  });
});
