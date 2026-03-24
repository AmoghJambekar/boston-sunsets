export function wmoDescription(code: number): string {
  const m: Record<number, string> = {
    0: 'clear',
    1: 'mainly clear',
    2: 'partly cloudy',
    3: 'overcast',
    45: 'fog',
    48: 'depositing rime fog',
    51: 'light drizzle',
    53: 'drizzle',
    55: 'dense drizzle',
    56: 'freezing drizzle',
    57: 'dense freezing drizzle',
    61: 'slight rain',
    63: 'rain',
    65: 'heavy rain',
    66: 'freezing rain',
    67: 'heavy freezing rain',
    71: 'slight snow',
    73: 'snow',
    75: 'heavy snow',
    77: 'snow grains',
    80: 'rain showers',
    81: 'moderate rain showers',
    82: 'violent rain showers',
    85: 'snow showers',
    86: 'heavy snow showers',
    95: 'thunderstorm',
    96: 'thunderstorm with hail',
    99: 'thunderstorm with heavy hail',
  };
  return m[code] ?? 'unknown';
}

export function cardinalDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const i = Math.round(deg / 45) % 8;
  return dirs[i];
}
