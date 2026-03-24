import { useEffect, useState } from 'react';
import type { WeatherData } from '../types/weather';
import {
  buildWeatherData,
  fetchArchiveDay,
  fetchForecastBlock,
  isPastDayET,
} from '../lib/openMeteo';

const weatherCache = new Map<string, WeatherData>();
let forecastHourly: Awaited<ReturnType<typeof fetchForecastBlock>> | null = null;

export function useWeatherData(dateKey: string, sunset: Date | null) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sunset) {
      setData(null);
      setLoading(true);
      return;
    }
    let cancelled = false;
    const cached = weatherCache.get(dateKey);
    if (cached) {
      setData(cached);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    (async () => {
      try {
        if (isPastDayET(dateKey)) {
          const h = await fetchArchiveDay(dateKey);
          const wd = buildWeatherData(h, dateKey, sunset);
          weatherCache.set(dateKey, wd);
          if (!cancelled) setData(wd);
        } else {
          if (!forecastHourly) {
            forecastHourly = await fetchForecastBlock();
          }
          const wd = buildWeatherData(forecastHourly, dateKey, sunset);
          weatherCache.set(dateKey, wd);
          if (!cancelled) setData(wd);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dateKey, sunset]);

  return { data, loading, error };
}

/** For DateNav parallel score preload — respects cache */
export async function ensureWeatherForDate(
  dateKey: string,
  sunset: Date
): Promise<WeatherData> {
  const cached = weatherCache.get(dateKey);
  if (cached) return cached;
  if (isPastDayET(dateKey)) {
    const h = await fetchArchiveDay(dateKey);
    const wd = buildWeatherData(h, dateKey, sunset);
    weatherCache.set(dateKey, wd);
    return wd;
  }
  if (!forecastHourly) {
    forecastHourly = await fetchForecastBlock();
  }
  const wd = buildWeatherData(forecastHourly, dateKey, sunset);
  weatherCache.set(dateKey, wd);
  return wd;
}
