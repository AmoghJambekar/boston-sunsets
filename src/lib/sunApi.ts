import { BOSTON_LAT, BOSTON_LON } from './constants';

export type SunTimes = {
  sunrise: Date;
  sunset: Date;
};

const sunCache = new Map<string, SunTimes>();

export async function fetchSunTimes(dateKey: string): Promise<SunTimes> {
  const hit = sunCache.get(dateKey);
  if (hit) return hit;
  const url = `https://api.sunrise-sunset.org/json?lat=${BOSTON_LAT}&lng=${BOSTON_LON}&date=${dateKey}&formatted=0`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Sun API failed');
  const data = (await res.json()) as {
    results: { sunrise: string; sunset: string };
  };
  const times: SunTimes = {
    sunrise: new Date(data.results.sunrise),
    sunset: new Date(data.results.sunset),
  };
  sunCache.set(dateKey, times);
  return times;
}
