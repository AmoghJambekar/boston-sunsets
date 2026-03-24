import { TIMEZONE } from './constants';

export function dateKeyET(d: Date = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

/** Calendar dates (today ± days), as YYYY-MM-DD in ET */
export function enumerateDateRange(centerKey: string, daysEachSide: number): string[] {
  const [y, m, d] = centerKey.split('-').map(Number);
  const out: string[] = [];
  for (let i = -daysEachSide; i <= daysEachSide; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i, 16, 0, 0));
    out.push(dateKeyET(dt));
  }
  return out;
}

export function formatHudDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format a calendar date key as seen in Boston (e.g. Mar 23, 2026) */
export function formatDateKeyLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 17, 0, 0));
  return dt.toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatHudTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
