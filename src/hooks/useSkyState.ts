import { useEffect, useMemo, useState } from 'react';
import type { SkyPhase } from '../lib/gradientMapper';
import { computeSkyPhase } from '../lib/skyPhase';

export function useSkyState(
  selectedDateKey: string,
  sunrise: Date | null,
  sunset: Date | null
) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const phase: SkyPhase = useMemo(() => {
    if (!sunrise || !sunset) return 'midday';
    return computeSkyPhase(now, selectedDateKey, sunrise, sunset);
  }, [now, selectedDateKey, sunrise, sunset]);

  const minutesToSunset = useMemo(() => {
    if (!sunset) return 0;
    return (sunset.getTime() - now.getTime()) / 60000;
  }, [now, sunset]);

  return { now, phase, minutesToSunset };
}
