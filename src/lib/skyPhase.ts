import type { SkyPhase } from './gradientMapper';
import { dateKeyET } from './dates';

const H = 60 * 60 * 1000;
const M = 60 * 1000;

function hourET(d: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(d);
  const h = parts.find((p) => p.type === 'hour')?.value;
  return h ? parseInt(h, 10) : 12;
}

/** Phase from wall clock + selected day's sunrise/sunset (UTC instants) */
export function computeSkyPhase(
  now: Date,
  selectedDateKey: string,
  sunrise: Date,
  sunset: Date
): SkyPhase {
  const nowKey = dateKeyET(now);
  const t = now.getTime();
  const sr = sunrise.getTime();
  const ss = sunset.getTime();

  if (nowKey > selectedDateKey) {
    return 'night';
  }
  if (nowKey < selectedDateKey) {
    const h = hourET(now);
    if (h < 5) return 'deep_night';
    if (h < 12) return 'morning';
    if (h < 17) return 'midday';
    return 'afternoon';
  }

  if (t < sr) {
    if (t < sr - 3 * H) return 'deep_night';
    if (t < sr - 60 * M) return 'deep_night';
    if (t < sr - 30 * M) return 'dawn';
    return 'dawn';
  }

  if (t >= sr && t < sr + 4 * H) return 'morning';
  if (t >= sr + 4 * H && t < ss - 3 * H) return 'midday';
  if (t >= ss - 3 * H && t < ss - 1 * H) return 'afternoon';
  if (t >= ss - 1 * H && t < ss - 15 * M) return 'pre_sunset';
  if (t >= ss - 15 * M && t < ss + 30 * M) return 'golden_hour';
  if (t >= ss + 30 * M && t < ss + 60 * M) return 'dusk';
  if (t >= ss + 60 * M && t < ss + 120 * M) return 'evening';
  if (t >= ss + 120 * M) return 'night';
  return 'midday';
}
