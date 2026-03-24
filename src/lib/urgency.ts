import type { Urgency } from '../types/weather';

/** minutes: positive = before sunset, negative = after */
export function urgencyFromMinutes(minutesToSunset: number): Urgency {
  if (minutesToSunset > 60) return 'early';
  if (minutesToSunset > 15) return 'soon';
  if (minutesToSunset > 0) return 'now';
  const after = -minutesToSunset;
  if (after <= 30) return 'during';
  return 'passed';
}
