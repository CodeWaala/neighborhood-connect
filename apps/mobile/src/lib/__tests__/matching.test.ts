import {
  groupByWindow,
  initial,
  joinDays,
  overlapSentence,
  overlappingSlots,
  roleContext,
  sharedInterests,
  sharedSummary,
  sortDays,
  type AvailabilitySlot,
} from '../matching';

const MORNING = { id: 'w-m', label: 'Morning', timeRange: '6am-12pm' };
const AFTERNOON = { id: 'w-a', label: 'Afternoon', timeRange: '12pm-5pm' };
const EVENING = { id: 'w-e', label: 'Evening', timeRange: '5pm-9pm' };
const slot = (dayOfWeek: string, window = MORNING): AvailabilitySlot => ({ dayOfWeek, window });

describe('days', () => {
  it('sorts days Monday-first and drops duplicates', () => {
    expect(sortDays(['sun', 'tue', 'mon', 'tue'])).toEqual(['mon', 'tue', 'sun']);
  });

  it.each([
    [[], ''],
    [['tue'], 'Tue'],
    [['thu', 'tue'], 'Tue & Thu'],
    [['sat', 'mon', 'thu'], 'Mon, Thu & Sat'],
  ])('joins %j as "%s"', (days, expected) => {
    expect(joinDays(days)).toBe(expected);
  });
});

describe('sharedInterests', () => {
  it('keeps their interests that I also have, in their order', () => {
    const mine = [
      { id: 'a', label: 'Stroller walks' },
      { id: 'b', label: 'Coffee outings' },
    ];
    const theirs = [
      { id: 'c', label: 'Dog walks' },
      { id: 'b', label: 'Coffee outings' },
      { id: 'a', label: 'Stroller walks' },
    ];
    expect(sharedInterests(mine, theirs).map((i) => i.id)).toEqual(['b', 'a']);
  });
});

describe('overlappingSlots', () => {
  it('needs the same day AND the same time window', () => {
    const mine = [slot('tue'), slot('sun', EVENING)];
    // Sun morning: same day as my Sun evening, same window as my Tue morning, but no real overlap
    const theirs = [slot('tue'), slot('sun'), slot('wed', AFTERNOON)];
    expect(overlappingSlots(mine, theirs)).toEqual([slot('tue')]);
  });
});

describe('groupByWindow', () => {
  it('groups days per window, windows in time-of-day order', () => {
    const groups = groupByWindow([slot('sun', EVENING), slot('thu'), slot('tue'), slot('sat', AFTERNOON)]);
    expect(groups.map((g) => [g.window.label, g.days])).toEqual([
      ['Morning', ['tue', 'thu']],
      ['Afternoon', ['sat']],
      ['Evening', ['sun']],
    ]);
  });
});

describe('overlapSentence', () => {
  it('is null without overlap', () => {
    expect(overlapSentence([])).toBeNull();
  });

  it('describes one window', () => {
    expect(overlapSentence([slot('thu'), slot('tue')])).toBe('You’re both free Tue & Thu mornings');
  });

  it('describes several windows', () => {
    expect(overlapSentence([slot('sat'), slot('sun', EVENING)])).toBe(
      'You’re both free Sat mornings and Sun evenings',
    );
  });
});

describe('sharedSummary', () => {
  const coffee = { id: 'b', label: 'Coffee outings' };
  const stroller = { id: 'a', label: 'Stroller walks' };

  it('combines interests and times', () => {
    expect(sharedSummary([stroller], [slot('sat'), slot('sun')])).toBe(
      'You both enjoy stroller walks and are free Sat & Sun mornings.',
    );
  });

  it('lists several interests', () => {
    expect(sharedSummary([stroller, coffee], [], 'You and Maya both')).toBe(
      'You and Maya both enjoy stroller walks and coffee outings.',
    );
  });

  it('handles times only, and nothing', () => {
    expect(sharedSummary([], [slot('tue')])).toBe('You both are free Tue mornings.');
    expect(sharedSummary([], [])).toBeNull();
  });
});

describe('labels', () => {
  it('describes roles and passes unknown ones through', () => {
    expect(roleContext('parent')).toBe('Parent');
    expect(roleContext('pet')).toBe('Pet parent');
    expect(roleContext('both')).toBe('Parent & pet parent');
    expect(roleContext('other')).toBe('other');
  });

  it('takes an upper-case initial, with a fallback', () => {
    expect(initial('  maya')).toBe('M');
    expect(initial('')).toBe('?');
    expect(initial(null)).toBe('?');
  });
});
