import type { Neighborhood } from '@neighborhood-connect/api-client';

/** "City, State ZIP" line under a neighborhood name. */
export function neighborhoodDetail(n: Neighborhood): string {
  const regionZip = [n.region, n.postalCode].filter(Boolean).join(' ');
  return [n.city, regionZip].filter(Boolean).join(', ');
}

/** API time ranges look like "6am-12pm"; show them as "6am – 12pm". */
export function formatTimeRange(range: string): string {
  return range.replace(/\s*-\s*/, ' – ');
}

/** Start hour (0–23) of a range like "6am-12pm", for sorting; unknown formats sort last. */
export function rangeStartHour(range: string): number {
  const match = /^\s*(\d{1,2})\s*(am|pm)/i.exec(range);
  if (!match) return 24;
  const hour = Number(match[1]) % 12;
  return match[2].toLowerCase() === 'pm' ? hour + 12 : hour;
}
