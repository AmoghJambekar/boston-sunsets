export type SkyPhase =
  | 'deep_night'
  | 'dawn'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'pre_sunset'
  | 'golden_hour'
  | 'dusk'
  | 'evening'
  | 'night';

export type GradientInput = {
  score: number;
  cloudLow: number;
  cloudMid: number;
  cloudHigh: number;
  timeOfDay: SkyPhase;
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const k = Math.min(1, Math.max(0, t));
  return rgbToHex(ar + (br - ar) * k, ag + (bg - ag) * k, ab + (bb - ab) * k);
}

function lerpStops(
  stopsA: string[],
  stopsB: string[],
  t: number
): string[] {
  const len = Math.max(stopsA.length, stopsB.length);
  const out: string[] = [];
  for (let i = 0; i < len; i++) {
    const ca = stopsA[Math.min(i, stopsA.length - 1)];
    const cb = stopsB[Math.min(i, stopsB.length - 1)];
    out.push(lerpColor(ca, cb, t));
  }
  return out;
}

function stopsToCss(stops: string[]): string {
  if (stops.length === 2) {
    return `linear-gradient(to bottom, ${stops[0]}, ${stops[1]})`;
  }
  const n = stops.length - 1;
  const parts = stops.map((c, i) => `${c} ${Math.round((i / n) * 100)}%`);
  return `linear-gradient(to bottom, ${parts.join(', ')})`;
}

const GRADIENTS = {
  deep_night: {
    clear: ['#0a0f1e', '#0d1b2a'],
    murky: ['#080808', '#0a0a0a'],
  },
  dawn: {
    clear: ['#f5cba7', '#f0e6d3', '#ffd699'],
    murky: ['#b0b0b0', '#c8c8c8'],
  },
  morning: {
    clear: ['#4a9abb', '#b8d9e8', '#e8f4f8'],
    murky: ['#a8a8a8', '#c5c5c5'],
  },
  midday: {
    clear: ['#4a7fc1', '#8db8d8', '#ddeeff'],
    murky: ['#b5b5b5', '#d0d0d0'],
  },
  afternoon: {
    clear: ['#5588c8', '#a8cce0', '#ddeeff'],
    murky: ['#b8b8b8', '#d5d5d5'],
  },
  pre_sunset: {
    clear: ['#6a8fba', '#c4a882', '#f5d5a0'],
    murky: ['#c0bab8', '#d8d5d3'],
  },
  golden_hour: {
    clear: ['#2d4a6e', '#c4601a', '#f0a030', '#ffd080'],
    wispy: ['#3a3060', '#b05080', '#e8906a', '#f5d090'],
    mid_layer: ['#4a3520', '#d4701a', '#f5b030', '#fde88a'],
    overcast: ['#888090', '#b0a8a0', '#d8d0c8'],
    murky: ['#706860', '#c0a880', '#d8c090'],
  },
  dusk: {
    clear: ['#1a2a4a', '#c87060', '#e8b090', '#d4a878'],
    murky: ['#706860', '#b0a090'],
  },
  evening: {
    clear: ['#0f1a2e', '#1e2a40', '#2a3550'],
    murky: ['#151515', '#222222'],
  },
  night: {
    clear: ['#080d18', '#0d1520'],
    murky: ['#050505', '#0a0a0a'],
  },
} as const;

function murkyFactor(cloudLow: number, cloudHigh: number): number {
  let f = 0;
  if (cloudLow > 50) f += Math.min(1, (cloudLow - 50) / 50) * 0.55;
  if (cloudHigh > 80) f += Math.min(1, (cloudHigh - 80) / 20) * 0.55;
  return Math.min(1, f);
}

function goldenHourPalette(
  cloudLow: number,
  cloudMid: number,
  cloudHigh: number
): string[] {
  const murky = murkyFactor(cloudLow, cloudHigh);
  const wispyBlend =
    cloudMid >= 20 && cloudMid <= 60 && cloudHigh > 20
      ? Math.min(1, (cloudHigh / 100) * (cloudMid / 60))
      : 0;
  const midBlend =
    cloudMid >= 20 && cloudMid <= 60 && cloudHigh <= 40
      ? Math.min(1, cloudMid / 80)
      : 0;

  let base: keyof typeof GRADIENTS.golden_hour = 'clear';
  if (cloudLow > 70 || (cloudMid > 70 && cloudHigh < 30)) base = 'overcast';
  else if (midBlend > wispyBlend && midBlend > 0.25) base = 'mid_layer';
  else if (wispyBlend > 0.2) base = 'wispy';

  const clearStops: string[] = [...GRADIENTS.golden_hour[base]];
  const wispyStops: string[] = [...GRADIENTS.golden_hour.wispy];
  const midStops: string[] = [...GRADIENTS.golden_hour.mid_layer];

  let stops: string[] = clearStops;
  if (base === 'clear') {
    stops = lerpStops(clearStops, wispyStops, wispyBlend * 0.85);
    stops = lerpStops(stops, midStops, midBlend * 0.6);
  }
  stops = lerpStops(stops, [...GRADIENTS.golden_hour.murky], murky);
  return stops;
}

function phaseStops(
  phase: SkyPhase,
  cloudLow: number,
  cloudMid: number,
  cloudHigh: number
): string[] {
  if (phase === 'golden_hour') {
    return goldenHourPalette(cloudLow, cloudMid, cloudHigh);
  }
  const key = phase as Exclude<SkyPhase, 'golden_hour'>;
  const entry = GRADIENTS[key];
  const murky = murkyFactor(cloudLow, cloudHigh);
  return lerpStops([...entry.clear], [...entry.murky], murky);
}

/** Pure: weather + phase → CSS linear-gradient string */
export function gradientFromState(input: GradientInput): string {
  const { cloudLow, cloudMid, cloudHigh, timeOfDay } = input;
  const stops = phaseStops(timeOfDay, cloudLow, cloudMid, cloudHigh);
  return stopsToCss(stops);
}

/** Bright sky phases → dark score text */
export function isBrightPhase(phase: SkyPhase): boolean {
  return (
    phase === 'morning' ||
    phase === 'midday' ||
    phase === 'afternoon' ||
    phase === 'pre_sunset' ||
    phase === 'golden_hour' ||
    phase === 'dawn'
  );
}
