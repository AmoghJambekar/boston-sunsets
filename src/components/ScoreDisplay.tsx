import { useEffect, useRef, useState } from 'react';
import type { SkyPhase } from '../lib/gradientMapper';
import { isBrightPhase } from '../lib/gradientMapper';

type Props = {
  score: number;
  label: string;
  sublabel: string;
  phase: SkyPhase;
  animKey: string;
};

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function ScoreDisplay({ score, label, sublabel, phase, animKey }: Props) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(0);

  const bright = isBrightPhase(phase);
  const lifetime = score >= 9.8;

  useEffect(() => {
    const duration = 600;
    const from = 0;
    const to = score;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const v = from + (to - from) * easeOutCubic(t);
      setDisplay(v);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animKey, score]);

  const textClass = bright
    ? 'score-display__text score-display__text--dark'
    : 'score-display__text score-display__text--light';

  return (
    <div className="score-display">
      <div className={`${textClass} score-display__score`}>
        {display.toFixed(1)}/10
      </div>
      <div
        className={`${textClass} score-display__label ${lifetime ? 'score-display__label--lifetime' : ''}`}
      >
        {label}
      </div>
      {sublabel ? (
        <div
          className={`${textClass} score-display__sublabel ${lifetime ? 'score-display__sublabel--fade' : ''}`}
        >
          {sublabel}
        </div>
      ) : null}
    </div>
  );
}
