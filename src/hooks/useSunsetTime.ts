import { useEffect, useState } from 'react';
import { fetchSunTimes } from '../lib/sunApi';

export function useSunsetTime(dateKey: string) {
  const [sunrise, setSunrise] = useState<Date | null>(null);
  const [sunset, setSunset] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const times = await fetchSunTimes(dateKey);
        if (!cancelled) {
          setSunrise(times.sunrise);
          setSunset(times.sunset);
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
  }, [dateKey]);

  return { sunrise, sunset, loading, error };
}
