import type { ProfileRole } from '@neighborhood-connect/api-client';

import { rangeStartHour } from '@/onboarding/format';

// ──────────────────────────────────────────────
// Shared interests and overlapping availability between two people.
// Pure functions: inputs are the shapes the API returns for profiles and matches.
// ──────────────────────────────────────────────

export interface InterestRef {
  id: string;
  label: string;
}

export interface AvailabilitySlot {
  dayOfWeek: string;
  window: { id: string; label: string; timeRange: string };
}

const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_SHORT: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export function dayShort(day: string): string {
  return DAY_SHORT[day] ?? day;
}

export function sortDays(days: Iterable<string>): string[] {
  return [...new Set(days)].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
}

/** "Tue", "Tue & Thu", "Mon, Tue & Thu" */
export function joinDays(days: string[]): string {
  const labels = sortDays(days).map(dayShort);
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`;
}

export function sharedInterests(mine: InterestRef[], theirs: InterestRef[]): InterestRef[] {
  const myIds = new Set(mine.map((i) => i.id));
  return theirs.filter((i) => myIds.has(i.id));
}

/** Slots (same day AND same time window) both people are free. */
export function overlappingSlots(mine: AvailabilitySlot[], theirs: AvailabilitySlot[]): AvailabilitySlot[] {
  const myKeys = new Set(mine.map((s) => `${s.dayOfWeek}|${s.window.id}`));
  return theirs.filter((s) => myKeys.has(`${s.dayOfWeek}|${s.window.id}`));
}

/** Group slots by time window (in time-of-day order), each with its sorted days. */
export function groupByWindow(slots: AvailabilitySlot[]): { window: AvailabilitySlot['window']; days: string[] }[] {
  const groups = new Map<string, { window: AvailabilitySlot['window']; days: string[] }>();
  for (const slot of slots) {
    const group = groups.get(slot.window.id) ?? { window: slot.window, days: [] };
    group.days.push(slot.dayOfWeek);
    groups.set(slot.window.id, group);
  }
  return [...groups.values()]
    .map((g) => ({ window: g.window, days: sortDays(g.days) }))
    .sort((a, b) => rangeStartHour(a.window.timeRange) - rangeStartHour(b.window.timeRange));
}

/**
 * "You're both free Tue & Thu mornings" / "… Sat mornings and Sun evenings".
 * Null when there is no day+time overlap.
 */
export function overlapSentence(slots: AvailabilitySlot[]): string | null {
  const groups = groupByWindow(slots);
  if (groups.length === 0) return null;
  const parts = groups.map((g) => `${joinDays(g.days)} ${g.window.label.toLowerCase()}s`);
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
  return `You’re both free ${list}`;
}

/** Short description of someone's role: "Parent", "Pet parent", "Parent & pet parent". */
export function roleContext(role: ProfileRole): string {
  switch (role) {
    case 'parent':
      return 'Parent';
    case 'pet':
      return 'Pet parent';
    case 'both':
      return 'Parent & pet parent';
  }
}

/** First letter for avatar circles. */
export function initial(name: string | null | undefined): string {
  return (name?.trim()[0] ?? '?').toUpperCase();
}
