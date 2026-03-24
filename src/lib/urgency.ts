import type { Urgency } from '../types/weather';

/**
 * Labels vs real clock: before evening golden hour starts, in the warm window, or after.
 */
export function urgencyFromGoldenWindow(
  now: Date,
  goldenHourStart: Date,
  sunset: Date
): Urgency {
  const minToGolden = (goldenHourStart.getTime() - now.getTime()) / 60000;
  const minToSunset = (sunset.getTime() - now.getTime()) / 60000;
  const afterSunset = -minToSunset;

  if (afterSunset > 30) return 'passed';
  if (afterSunset >= 0 && afterSunset <= 30) return 'during';

  if (minToGolden > 60) return 'early';
  if (minToGolden > 15) return 'soon';
  if (minToGolden > 0) return 'now';

  if (minToSunset > 0) return 'during';
  return 'passed';
}
