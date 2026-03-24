import { useEffect, useRef } from 'react';
import type { WeatherRow } from '../types/weather';
import type { SkyPhase } from '../lib/gradientMapper';

type Props = {
  row: WeatherRow | null;
  phase: SkyPhase;
};

type CloudBlob = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  layer: 'low' | 'mid' | 'high';
};

type Star = {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  twinkleOffset: number;
  twinkleSpeed: number;
};

type RainDrop = {
  x: number;
  y: number;
  len: number;
  vx: number;
  vy: number;
};

type SnowFlake = {
  x: number;
  y: number;
  r: number;
  vy: number;
  wobbleSpeed: number;
  wobbleOffset: number;
};

const MAX_BLUR_DRAWS = 40;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function SkyCanvas({ row, phase }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cloudsRef = useRef<CloudBlob[]>([]);
  const starsRef = useRef<Star[]>([]);
  const rainRef = useRef<RainDrop[]>([]);
  const snowRef = useRef<SnowFlake[]>([]);
  const raysSeedRef = useRef(0);
  const rayWidthsRef = useRef<number[]>([]);
  const lastInitKey = useRef('');
  const eveningStartRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initSystems = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mobile = w < 768;
      const scale = mobile ? 0.5 : 1;
      const r = row;
      const cloudCover = r
        ? (r.cloudLow + r.cloudMid + r.cloudHigh) / 3
        : 50;

      const key = `${phase}-${r?.time ?? 'none'}`;
      if (key !== lastInitKey.current) {
        lastInitKey.current = key;
        raysSeedRef.current = Math.random() * 1000;
        rayWidthsRef.current = Array.from({ length: 14 }, () => rand(2, 8));
        if (phase === 'evening') eveningStartRef.current = performance.now();
      }

      const lowN = r
        ? Math.floor((r.cloudLow / 100) * 8 * scale)
        : 2;
      const midN = r
        ? Math.floor((r.cloudMid / 100) * 12 * scale)
        : 2;
      const highN = r
        ? Math.floor((r.cloudHigh / 100) * 20 * scale)
        : 2;

      const blobs: CloudBlob[] = [];
      const pushLayer = (n: number, layer: CloudBlob['layer']) => {
        for (let i = 0; i < n; i++) {
          blobs.push({
            cx: rand(-0.2, 1.2) * w,
            cy: rand(0.1, 0.55) * h,
            rx: rand(80, 180) * (mobile ? 0.85 : 1),
            ry: rand(35, 90) * (mobile ? 0.85 : 1),
            layer,
          });
        }
      };
      pushLayer(lowN, 'low');
      pushLayer(midN, 'mid');
      pushLayer(highN, 'high');
      cloudsRef.current = blobs;

      const starPhases =
        phase === 'evening' || phase === 'night' || phase === 'deep_night';
      if (starPhases) {
        const count = Math.floor((1 - cloudCover / 100) * 200 * scale);
        const stars: Star[] = [];
        for (let i = 0; i < count; i++) {
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h * 0.65,
            r: rand(0.5, 1.5),
            baseOpacity: rand(0.4, 1),
            twinkleOffset: Math.random() * Math.PI * 2,
            twinkleSpeed: rand(0.8, 2.5),
          });
        }
        starsRef.current = stars;
      } else {
        starsRef.current = [];
      }

      const precip = r?.precipitation ?? 0;
      if (precip > 0) {
        const n = Math.min(300, Math.floor(precip * 30 * scale));
        const drops: RainDrop[] = [];
        const fallPerSec = (600 + (r?.windspeed ?? 0) * 5) / 60;
        for (let i = 0; i < n; i++) {
          drops.push({
            x: Math.random() * w,
            y: Math.random() * h,
            len: precip > 5 ? rand(10, 16) : rand(15, 25),
            vx: 2,
            vy: fallPerSec,
          });
        }
        rainRef.current = drops;
      } else {
        rainRef.current = [];
      }

      const snow = r?.snowfall ?? 0;
      if (snow > 0) {
        const n = Math.min(200, Math.floor(snow * 40 * scale));
        const flakes: SnowFlake[] = [];
        for (let i = 0; i < n; i++) {
          flakes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: rand(1, 4),
            vy: rand(30, 80) / 60,
            wobbleSpeed: rand(1, 3),
            wobbleOffset: Math.random() * Math.PI * 2,
          });
        }
        snowRef.current = flakes;
      } else {
        snowRef.current = [];
      }
    };

    resize();
    initSystems();

    const onResize = () => {
      resize();
      initSystems();
    };
    window.addEventListener('resize', onResize);

    const draw = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mobile = w < 768;
      const r = row;
      const windRad = r ? (r.winddirection * Math.PI) / 180 : 0;
      const windSpeed = r?.windspeed ?? 5;
      const golden =
        phase === 'golden_hour' ||
        phase === 'pre_sunset' ||
        phase === 'dusk';

      ctx.clearRect(0, 0, w, h);

      const vxBase = (windSpeed / 3.6) * 0.15;
      const vxLow = vxBase * Math.cos(windRad) * 0.8;
      const vyLow = vxBase * Math.sin(windRad) * 0.2;
      const vxMid = vxBase * Math.cos(windRad) * 0.5;
      const vyMid = vxBase * Math.sin(windRad) * 0.2;
      const vxHi = vxBase * Math.cos(windRad) * 0.3;
      const vyHi = vxBase * Math.sin(windRad) * 0.2;

      const blurLow = 52;
      const blurMid = 32;
      const blurHi = 15;

      let blurDraws = 0;

      const drawLayer = (
        layer: CloudBlob['layer'],
        blur: number,
        baseRgb: [number, number, number],
        cover: number
      ) => {
        const op = Math.min(
          0.75,
          0.25 + (cover / 100) * (layer === 'low' ? 0.45 : layer === 'mid' ? 0.35 : 0.2)
        );
        for (const b of cloudsRef.current) {
          if (b.layer !== layer) continue;
          if (blurDraws >= MAX_BLUR_DRAWS) return;
          blurDraws++;
          b.cx +=
            layer === 'low' ? vxLow : layer === 'mid' ? vxMid : vxHi;
          b.cy +=
            layer === 'low' ? vyLow : layer === 'mid' ? vyMid : vyHi;
          if (b.cx > w + b.rx * 2) b.cx = -b.rx * 2;
          if (b.cx < -b.rx * 2) b.cx = w + b.rx * 2;

          const [br, bg, bb] = golden && layer !== 'high'
            ? [
                baseRgb[0] + (200 - baseRgb[0]) * 0.35,
                baseRgb[1] + (140 - baseRgb[1]) * 0.35,
                baseRgb[2] + (80 - baseRgb[2]) * 0.35,
              ]
            : baseRgb;

          ctx.save();
          ctx.filter = `blur(${blur}px)`;
          ctx.fillStyle = `rgba(${br},${bg},${bb},${op})`;
          ctx.beginPath();
          ctx.ellipse(b.cx, b.cy, b.rx, b.ry, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      };

      if (r) {
        drawLayer('low', blurLow, [120, 115, 110], r.cloudLow);
        drawLayer('mid', blurMid, [160, 155, 165], r.cloudMid);
        drawLayer('high', blurHi, [220, 215, 230], r.cloudHigh);
      }

      const starPhases =
        phase === 'evening' || phase === 'night' || phase === 'deep_night';
      if (starPhases && starsRef.current.length) {
        const es = eveningStartRef.current;
        const fade =
          phase === 'evening' && es !== null
            ? Math.min(1, (t - es) / (10 * 60 * 1000))
            : 1;
        for (const s of starsRef.current) {
          const tw =
            Math.sin(t * 0.001 * s.twinkleSpeed + s.twinkleOffset) * 0.3 +
            s.baseOpacity;
          ctx.fillStyle = `rgba(255,255,255,${tw * fade})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const raysOk =
        !mobile &&
        (phase === 'pre_sunset' || phase === 'golden_hour') &&
        (r?.cloudLow ?? 0) <= 60;
      if (raysOk && r) {
        const shortwave = r.shortwave || 400;
        const swFactor = Math.min(1, shortwave / 800);
        const clearFactor = 1 - r.cloudLow / 100;
        const pulse = 0.05 + Math.sin(t * 0.00125 + raysSeedRef.current) * 0.02;
        const baseOp = (0.03 + pulse) * swFactor * clearFactor;
        const cx = w * 0.5;
        const cy = h * 0.85;
        const rayCount = 14;
        const widths = rayWidthsRef.current;
        for (let i = 0; i < rayCount; i++) {
          const degW = widths[i] ?? 4;
          const arc = (degW * Math.PI) / 180;
          const spread = (i / (rayCount - 1) - 0.5) * 0.9;
          const a0 = spread * 0.9 - arc / 2 + raysSeedRef.current * 0.0001;
          const a1 = a0 + arc;
          ctx.fillStyle = `rgba(255,240,200,${baseOp})`;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(
            cx + Math.cos(a0) * h * 1.5,
            cy - Math.abs(Math.sin(a0)) * h * 1.5
          );
          ctx.lineTo(
            cx + Math.cos(a1) * h * 1.5,
            cy - Math.abs(Math.sin(a1)) * h * 1.5
          );
          ctx.closePath();
          ctx.fill();
        }
      }

      if (r && r.precipitation > 0) {
        ctx.filter = r.precipitation > 5 ? 'blur(0.5px)' : 'none';
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.4)';
        ctx.lineWidth = 1;
        for (const d of rainRef.current) {
          d.x += Math.cos(windRad) * d.vx * dt * 60;
          d.y += d.vy * dt * 60;
          if (d.y > h) {
            d.y = -20;
            d.x = Math.random() * w;
          }
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(
            d.x - Math.cos(windRad) * d.len,
            d.y - Math.sin(windRad) * d.len
          );
          ctx.stroke();
        }
        ctx.filter = 'none';
      }

      if (r && r.snowfall > 0) {
        for (const f of snowRef.current) {
          f.x +=
            Math.sin(t * 0.001 * f.wobbleSpeed + f.wobbleOffset) * 0.5 +
            Math.cos(windRad) * 0.8 * dt * 60;
          f.y += f.vy * dt * 60;
          if (f.y > h) {
            f.y = -5;
            f.x = Math.random() * w;
          }
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [row, phase]);

  return <canvas ref={ref} aria-hidden />;
}
