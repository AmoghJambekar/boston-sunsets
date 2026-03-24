import type { Urgency, WeatherRow } from '../types/weather';

const PRIMARY_LABELS: [number, string][] = [
  [0, "won't see a thing"],
  [0.5, 'stay inside'],
  [1.5, 'barely anything'],
  [2.5, 'pretty meh'],
  [3.5, 'low expectations'],
  [4.5, 'worth a glance'],
  [5.5, 'not bad actually'],
  [6.5, 'decent show tonight'],
  [7.5, 'looking promising'],
  [8.1, 'good reason to touch grass'],
  [9.1, 'go outside right now'],
  [9.8, 'lifetime sunset'],
];

export function getPrimaryLabel(score: number): string {
  let label = PRIMARY_LABELS[0][1];
  for (const [threshold, text] of PRIMARY_LABELS) {
    if (score >= threshold) label = text;
  }
  return label;
}

export function getSublabel(
  score: number,
  row: WeatherRow,
  urgency: Urgency
): string {
  if (urgency === 'passed') {
    if (score >= 9.8) return 'hope you saw that one';
    if (score >= 9.0) return 'that was a good one';
    if (score >= 8.0) return 'you missed it';
    if (score >= 6.0) return "wasn't bad";
    return 'nothing to miss';
  }
  if (urgency === 'during') {
    if (score >= 9.8) return "this doesn't happen often";
    if (score >= 9.0) return 'this is happening';
    if (score >= 8.0) return 'look west';
    return 'golden hour';
  }
  if (urgency === 'now') {
    if (score >= 9.0) return 'drop everything';
    if (score >= 8.0) return 'seriously, go outside';
    if (score >= 7.0) return 'worth stepping out';
    return 'maybe worth a look';
  }

  if (score >= 9.8) return "this doesn't happen often";
  if (score >= 9.0) {
    if (row.cloudHigh > 40) return 'cirrus is going to fire';
    return 'conditions are stacked';
  }
  if (score >= 8.0) {
    if (row.cloudHigh > 30 && row.cloudMid < 40) return 'cirrus might go off';
    if (row.cloudMid > 20 && row.cloudMid < 60) return 'clouds are cooking';
    return "sky's in the game";
  }
  if (score >= 7.0) {
    if (row.cloudHigh > 20) return 'high clouds look promising';
    return 'this could be something';
  }
  if (score >= 6.0) return 'some color incoming';
  if (score >= 5.0) return 'could go either way';
  if (score >= 4.0) return 'surprise us, sky';
  if (score >= 3.0) return 'something might flicker';
  if (score >= 2.0) return "sky's not cooperating";
  if (score >= 1.0) return 'not even worth looking';
  return '';
}
