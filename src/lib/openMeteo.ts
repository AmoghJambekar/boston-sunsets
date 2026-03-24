import type { WeatherData, WeatherRow } from '../types/weather';
import { BOSTON_LAT, BOSTON_LON, OPEN_METEO_HOURLY, TIMEZONE } from './constants';
import { dateKeyET } from './dates';

function safeNum(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

type OmHourly = {
  time: string[];
  cloud_cover_low: number[];
  cloud_cover_mid: number[];
  cloud_cover_high: number[];
  visibility: number[];
  precipitation: number[];
  snowfall: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  weather_code: number[];
  dew_point_2m: number[];
  temperature_2m: number[];
  shortwave_radiation: number[];
  pm2_5: number[];
};

function rowAt(h: OmHourly, i: number): WeatherRow {
  const low = h.cloud_cover_low[i] ?? 0;
  const mid = h.cloud_cover_mid[i] ?? 0;
  return {
    cloudLow: low,
    cloudMid: mid,
    cloudHigh: h.cloud_cover_high[i] ?? 0,
    /** Main Open-Meteo forecast has no west-sector columns; approximate with layer totals */
    cloudLowWest: low,
    cloudMidWest: mid,
    visibility: h.visibility[i] ?? 10000,
    precipitation: h.precipitation[i] ?? 0,
    snowfall: h.snowfall[i] ?? 0,
    dewpoint: h.dew_point_2m[i] ?? 0,
    temperature: h.temperature_2m[i] ?? 0,
    windspeed: h.wind_speed_10m[i] ?? 0,
    winddirection: h.wind_direction_10m[i] ?? 0,
    weathercode: h.weather_code[i] ?? 0,
    pm25: safeNum(h.pm2_5[i], 15),
    shortwave: h.shortwave_radiation[i] ?? 0,
    time: h.time[i] ?? '',
  };
}

function closestHourIndex(times: string[], target: Date): number {
  const targetMs = target.getTime();
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]).getTime();
    const d = Math.abs(t - targetMs);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  }
  return best;
}

export async function fetchForecastBlock(): Promise<OmHourly> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${BOSTON_LAT}&longitude=${BOSTON_LON}` +
    `&hourly=${OPEN_METEO_HOURLY}&timezone=${encodeURIComponent(TIMEZONE)}&forecast_days=4`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast failed');
  const json = (await res.json()) as { hourly: OmHourly };
  return json.hourly;
}

export async function fetchArchiveDay(dateKey: string): Promise<OmHourly> {
  const url =
    `https://archive-api.open-meteo.com/v1/archive?latitude=${BOSTON_LAT}&longitude=${BOSTON_LON}` +
    `&start_date=${dateKey}&end_date=${dateKey}` +
    `&hourly=${OPEN_METEO_HOURLY}&timezone=${encodeURIComponent(TIMEZONE)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Archive failed');
  const json = (await res.json()) as { hourly: OmHourly };
  return json.hourly;
}

/** Slice hourly to rows for a single calendar date (ET) */
function sliceHourlyForDate(h: OmHourly, dateKey: string): OmHourly {
  const indices: number[] = [];
  for (let i = 0; i < h.time.length; i++) {
    if (h.time[i].startsWith(dateKey)) indices.push(i);
  }
  if (indices.length === 0) {
    return h;
  }
  const pick = <T>(arr: T[]): T[] => indices.map((j) => arr[j]);
  return {
    time: pick(h.time),
    cloud_cover_low: pick(h.cloud_cover_low),
    cloud_cover_mid: pick(h.cloud_cover_mid),
    cloud_cover_high: pick(h.cloud_cover_high),
    visibility: pick(h.visibility),
    precipitation: pick(h.precipitation),
    snowfall: pick(h.snowfall),
    wind_speed_10m: pick(h.wind_speed_10m),
    wind_direction_10m: pick(h.wind_direction_10m),
    weather_code: pick(h.weather_code),
    dew_point_2m: pick(h.dew_point_2m),
    temperature_2m: pick(h.temperature_2m),
    shortwave_radiation: pick(h.shortwave_radiation),
    pm2_5: pick(h.pm2_5),
  };
}

export function buildWeatherData(
  hourly: OmHourly,
  dateKey: string,
  sunset: Date
): WeatherData {
  const dayHourly = sliceHourlyForDate(hourly, dateKey);
  const idx = closestHourIndex(dayHourly.time, sunset);
  return {
    dateKey,
    row: rowAt(dayHourly, idx),
    hourlyTimes: dayHourly.time,
  };
}

export function isPastDayET(dateKey: string): boolean {
  const today = dateKeyET(new Date());
  return dateKey < today;
}
