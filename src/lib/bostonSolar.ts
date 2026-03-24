import SunCalc from 'suncalc';
import { BOSTON_LAT, BOSTON_LON, TIMEZONE } from './constants';
import { dateKeyET } from './dates';

/**
 * UTC instant on `dateKey` when clocks read 12:00 in America/New_York.
 * SunCalc needs a Date on the correct local calendar day for Boston.
 */
export function bostonNoonOnDateKey(dateKey: string): Date {
  const [Y, M, D] = dateKey.split('-').map(Number);
  for (let u = 0; u < 24; u++) {
    const d = new Date(Date.UTC(Y, M - 1, D, u, 0, 0));
    if (dateKeyET(d) !== dateKey) continue;
    const hourEt = parseInt(
      new Intl.DateTimeFormat('en-US', {
        timeZone: TIMEZONE,
        hour: 'numeric',
        hour12: false,
      }).format(d),
      10
    );
    if (hourEt === 12) return d;
  }
  return new Date(Date.UTC(Y, M - 1, D, 17, 0, 0));
}

export type BostonSunPack = {
  sunrise: Date;
  sunset: Date;
  /** Sun reaches 6° above horizon (evening); start of classic golden hour */
  goldenHourEveningStart: Date;
  /** Midpoint goldenHour→sunset — Open-Meteo row + sky paint anchor */
  viewAnchor: Date;
};

const packCache = new Map<string, BostonSunPack>();

/** Local astronomy only (SunCalc); no network. */
export function getBostonSunPack(dateKey: string): BostonSunPack {
  const hit = packCache.get(dateKey);
  if (hit) return hit;

  const noon = bostonNoonOnDateKey(dateKey);
  const t = SunCalc.getTimes(noon, BOSTON_LAT, BOSTON_LON);
  const golden = t.goldenHour;
  const sunset = t.sunset;
  const sunrise = t.sunrise;

  const viewAnchor = new Date((golden.getTime() + sunset.getTime()) / 2);

  const pack: BostonSunPack = {
    sunrise,
    sunset,
    goldenHourEveningStart: golden,
    viewAnchor,
  };
  packCache.set(dateKey, pack);
  return pack;
}
