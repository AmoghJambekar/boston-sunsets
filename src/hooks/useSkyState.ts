import { useEffect, useMemo, useState } from 'react';
import type { SkyPhase } from '../lib/gradientMapper';
import { computeSkyPhase } from '../lib/skyPhase';

export function useSkyState(
  selectedDateKey: string,
  sunrise: Date | null,
  sunset: Date | null,
  viewAnchor: Date | null
) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  /** Sky paint matches Open-Meteo row: instant within evening golden window */
  const phase: SkyPhase = useMemo(() => {
    if (!sunrise || !sunset || !viewAnchor) return 'midday';
    return computeSkyPhase(viewAnchor, selectedDateKey, sunrise, sunset);
  }, [selectedDateKey, sunrise, sunset, viewAnchor]);

  return { now, phase };
}
