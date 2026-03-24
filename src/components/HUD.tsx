import { formatDateKeyLabel, formatHudTime } from '../lib/dates';

type Props = {
  now: Date;
  selectedDateKey: string;
  todayKey: string;
  /** Evening golden hour begins (sun ~6°; SunCalc). Shown as main clock. */
  goldenHourStart: Date;
  brightSky: boolean;
};

function formatDelta(ms: number): string {
  const sign = ms <= 0 ? '+' : '';
  const abs = Math.abs(ms);
  const s = Math.floor(abs / 1000);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${sign}${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function HUD({
  now,
  selectedDateKey,
  todayKey,
  goldenHourStart,
  brightSky,
}: Props) {
  const deltaMs = goldenHourStart.getTime() - now.getTime();
  const countdown = formatDelta(deltaMs);
  const ink = brightSky ? 'hud--ink-dark' : 'hud--ink-light';

  return (
    <>
      <div className={`hud hud--left ${ink}`}>Boston</div>
      <div className={`hud hud--center ${ink}`}>
        <span>{formatHudTime(goldenHourStart)}</span>
        <span className="hud__countdown"> {countdown}</span>
      </div>
      <div
        className={`hud hud--right ${ink} ${selectedDateKey !== todayKey ? 'hud--alt' : ''}`}
      >
        {formatDateKeyLabel(selectedDateKey)}
      </div>
    </>
  );
}
