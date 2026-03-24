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

  /** Sky paint (gradient, canvas, chrome): always as at sunset for that day — matches Open-Meteo row at sunset. */
  const phase: SkyPhase = useMemo(() => {
    if (!sunrise || !sunset) return 'midday';
    return computeSkyPhase(sunset, selectedDateKey, sunrise, sunset);
  }, [selectedDateKey, sunrise, sunset]);

  /** Labels / HUD countdown: wall clock vs that date's sunset */
  const minutesToSunset = useMemo(() => {
    if (!sunset) return 0;
    return (sunset.getTime() - now.getTime()) / 60000;
  }, [now, sunset]);

  return { now, phase, minutesToSunset };
}
