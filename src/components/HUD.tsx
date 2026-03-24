import { formatDateKeyLabel, formatHudTime } from '../lib/dates';

type Props = {
  now: Date;
  selectedDateKey: string;
  todayKey: string;
  sunset: Date | null;
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

export function HUD({ now, selectedDateKey, todayKey, sunset }: Props) {
  const deltaMs = sunset ? sunset.getTime() - now.getTime() : 0;
  const countdown = sunset ? formatDelta(deltaMs) : '—:—:—';

  return (
    <>
      <div className="hud hud--left">Boston</div>
      <div className="hud hud--center">
        <span>{formatHudTime(now)}</span>
        <span className="hud__countdown"> {countdown}</span>
      </div>
      <div
        className={`hud hud--right ${selectedDateKey !== todayKey ? 'hud--alt' : ''}`}
      >
        {formatDateKeyLabel(selectedDateKey)}
      </div>
    </>
  );
}
