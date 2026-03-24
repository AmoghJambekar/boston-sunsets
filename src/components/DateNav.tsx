import { useEffect, useMemo, useState } from 'react';
import { enumerateDateRange } from '../lib/dates';
import { computeScore } from '../lib/scoreEngine';
import { ensureWeatherForDate } from '../hooks/useWeatherData';
import { fetchSunTimes } from '../lib/sunApi';

type Props = {
  todayKey: string;
  selectedKey: string;
  onSelect: (key: string) => void;
};

function shortDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 17, 0, 0));
  const wd = dt.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
  });
  const day = dt.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    day: 'numeric',
  });
  return `${wd} ${day}`;
}

function scoreDotClass(score: number | undefined): string {
  if (score === undefined) return 'date-nav__dot date-nav__dot--empty';
  if (score >= 8) return 'date-nav__dot date-nav__dot--high';
  if (score >= 6) return 'date-nav__dot date-nav__dot--mid';
  if (score >= 4) return 'date-nav__dot date-nav__dot--low';
  return 'date-nav__dot date-nav__dot--dim';
}

export function DateNav({ todayKey, selectedKey, onSelect }: Props) {
  const dates = useMemo(() => enumerateDateRange(todayKey, 3), [todayKey]);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        dates.map(async (dk) => {
          try {
            const { sunset } = await fetchSunTimes(dk);
            const wd = await ensureWeatherForDate(dk, sunset);
            return { dk, score: computeScore(wd.row) };
          } catch {
            return { dk, score: undefined as number | undefined };
          }
        })
      );
      if (cancelled) return;
      const next: Record<string, number> = {};
      for (const { dk, score } of results) {
        if (score !== undefined) next[dk] = score;
      }
      setScores(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [dates]);

  return (
    <nav className="date-nav" aria-label="Date range">
      {dates.map((dk) => {
        const isToday = dk === todayKey;
        const isSel = dk === selectedKey;
        const sc = scores[dk];
        return (
          <button
            key={dk}
            type="button"
            className={`date-nav__pill ${isSel ? 'date-nav__pill--active' : ''} ${isToday ? 'date-nav__pill--today' : ''}`}
            onClick={() => onSelect(dk)}
          >
            <span className="date-nav__label">{shortDayLabel(dk)}</span>
            <span className={scoreDotClass(sc)} aria-hidden />
          </button>
        );
      })}
    </nav>
  );
}
