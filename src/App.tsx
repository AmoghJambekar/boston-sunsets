import { useMemo, useState } from 'react';
import { ConditionsPanel } from './components/ConditionsPanel';
import { DateNav } from './components/DateNav';
import { HUD } from './components/HUD';
import { ScoreDisplay } from './components/ScoreDisplay';
import { SkyCanvas } from './components/SkyCanvas';
import { useSkyState } from './hooks/useSkyState';
import { useSunsetTime } from './hooks/useSunsetTime';
import { useWeatherData } from './hooks/useWeatherData';
import { dateKeyET } from './lib/dates';
import { gradientFromState, isBrightPhase } from './lib/gradientMapper';
import { scoreWeatherRow } from './lib/scoreEngine';
import { urgencyFromMinutes } from './lib/urgency';

export default function App() {
  const [selectedKey, setSelectedKey] = useState(() => dateKeyET(new Date()));
  const [conditionsOpen, setConditionsOpen] = useState(false);

  const { sunrise, sunset } = useSunsetTime(selectedKey);
  const { data: weather } = useWeatherData(selectedKey, sunset);
  const { now, phase, minutesToSunset } = useSkyState(selectedKey, sunrise, sunset);

  const todayKey = useMemo(() => dateKeyET(now), [now]);

  const urgency = urgencyFromMinutes(minutesToSunset);
  const row = weather?.row ?? null;

  const scored = useMemo(() => {
    if (!row) return { score: 0, label: '…', sublabel: '' };
    return scoreWeatherRow(row, urgency);
  }, [row, urgency]);

  const gradient = useMemo(() => {
    if (!row) return 'linear-gradient(to bottom, #4a7fc1, #ddeeff)';
    return gradientFromState({
      score: scored.score,
      cloudLow: row.cloudLow,
      cloudMid: row.cloudMid,
      cloudHigh: row.cloudHigh,
      timeOfDay: phase,
    });
  }, [row, phase, scored.score]);

  const brightSky = isBrightPhase(phase);
  const memory = selectedKey !== todayKey;

  const animKey = `${selectedKey}-${row?.time ?? ''}`;

  return (
    <div
      className={`app-root ${memory ? 'app-root--memory' : ''} ${brightSky ? 'app-root--bright-sky' : ''}`}
    >
      <div className="sky-background" style={{ background: gradient }} />
      <SkyCanvas row={row} phase={phase} />
      <HUD
        now={now}
        selectedDateKey={selectedKey}
        todayKey={todayKey}
        sunset={sunset}
        brightSky={brightSky}
      />
      <ScoreDisplay
        score={scored.score}
        label={scored.label}
        sublabel={scored.sublabel}
        phase={phase}
        animKey={animKey}
      />
      <p className="footnote">
        Trying to predict the sunset based on some <br />conditions,
        but it's up to the sky at the end of the day :)
      </p>
      <DateNav
        todayKey={todayKey}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />
      <ConditionsPanel
        open={conditionsOpen}
        onToggle={() => setConditionsOpen((o) => !o)}
        onClose={() => setConditionsOpen(false)}
        row={row}
        darkText={brightSky}
      />
    </div>
  );
}
