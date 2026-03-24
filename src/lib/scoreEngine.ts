import type { Urgency, WeatherRow } from '../types/weather';
import { getPrimaryLabel, getSublabel } from './labelEngine';

export function computeScore(row: WeatherRow): number {
  let score = 5.0;

  const {
    cloudLow,
    cloudMid,
    cloudHigh,
    cloudLowWest,
    cloudMidWest,
    visibility,
    precipitation,
    snowfall,
    dewpoint,
    temperature,
    weathercode,
    pm25,
  } = row;

  if (cloudHigh >= 20 && cloudHigh <= 70) score += 2.5;
  else if (cloudHigh > 70 && cloudHigh <= 90) score += 1.0;
  else if (cloudHigh > 90) score -= 0.5;

  if (cloudMid >= 10 && cloudMid <= 50) score += 1.5;
  else if (cloudMid > 50 && cloudMid <= 75) score += 0.5;
  else if (cloudMid > 75) score -= 0.5;

  if (cloudLow <= 10) score += 0.5;
  else if (cloudLow > 10 && cloudLow <= 30) score += 0.0;
  else if (cloudLow > 30 && cloudLow <= 60) score -= 1.5;
  else if (cloudLow > 60) score -= 3.0;

  if (cloudLowWest <= 15 && cloudMidWest >= 10 && cloudMidWest <= 60) score += 0.5;

  if (visibility >= 40000) score += 0.5;
  else if (visibility >= 20000) score += 0.0;
  else if (visibility >= 10000) score -= 0.5;
  else score -= 1.5;

  const dewSpread = temperature - dewpoint;
  if (dewSpread >= 15) score += 0.5;
  else if (dewSpread < 5) score -= 0.5;

  if (precipitation > 0 && precipitation <= 0.5) score -= 1.0;
  else if (precipitation > 0.5 && precipitation <= 2) score -= 2.5;
  else if (precipitation > 2) score -= 4.0;

  if (snowfall > 0 && snowfall <= 0.5) score -= 0.5;
  else if (snowfall > 0.5) score -= 2.0;

  if (pm25 >= 10 && pm25 <= 25) score += 0.3;
  else if (pm25 > 35) score -= 0.8;

  if (weathercode === 45 || weathercode === 48) score -= 3.0;
  if (weathercode >= 95) score -= 4.0;

  return Math.round(Math.min(10, Math.max(0, score)) * 10) / 10;
}

export function scoreWeatherRow(
  row: WeatherRow,
  urgency: Urgency
): { score: number; label: string; sublabel: string } {
  const score = computeScore(row);
  const label = getPrimaryLabel(score);
  const sublabel = getSublabel(score, row, urgency);
  return { score, label, sublabel };
}
