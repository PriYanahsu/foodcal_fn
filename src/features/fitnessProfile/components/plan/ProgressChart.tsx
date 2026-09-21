import type { WeightPoint } from '@/hooks/useWeightLog';

const W = 640;
const H = 240;
const PAD = { left: 44, right: 20, top: 16, bottom: 30 };

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/** Round a raw step up to something a person would label an axis with. */
function niceStep(raw: number) {
  const steps = [0.5, 1, 2, 2.5, 5, 10, 20];
  return steps.find((s) => s >= raw) ?? Math.ceil(raw / 10) * 10;
}

/**
 * Weigh-ins over time: gridded axis, the trend line, and a dashed goal line.
 * Fixed viewBox so the labels keep their proportions at any width.
 */
export default function ProgressChart({
  startPoint,
  points,
  target,
  className = 'h-auto w-full',
}: {
  startPoint: WeightPoint | null;
  points: WeightPoint[];
  target: number | null;
  /** `h-full w-full` lets the chart shrink into a one-screen layout. */
  className?: string;
}) {
  const weights = points.map((p) => p.weightKg);
  const all = target ? [...weights, target] : weights;
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const pad = Math.max(0.8, (hi - lo) * 0.25);
  const yMin = lo - pad;
  const yMax = hi + pad;

  const step = niceStep((yMax - yMin) / 3);
  const ticks: number[] = [];
  for (let t = Math.ceil(yMin / step) * step; t <= yMax; t += step) ticks.push(t);

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (points.length === 1 ? innerW : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + ((yMax - v) / (yMax - yMin)) * innerH;

  const line = points.map((p, i) => `${x(i)},${y(p.weightKg)}`).join(' ');
  const last = points[points.length - 1];
  const first = points[0];
  const middle = points[Math.floor((points.length - 1) / 2)];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label="Weight over time">
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(t)}
            y2={y(t)}
            className="stroke-line"
            strokeWidth="1"
          />
          <text
            x={PAD.left - 10}
            y={y(t)}
            dy="3.5"
            textAnchor="end"
            className="fill-muted text-[11px]"
          >
            {Number.isInteger(t) ? t : t.toFixed(1)}
          </text>
        </g>
      ))}

      {target && (
        <>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(target)}
            y2={y(target)}
            className="stroke-brand"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
          <text
            x={W - PAD.right}
            y={y(target) - 7}
            textAnchor="end"
            className="fill-brand-ink text-[11px] font-semibold"
          >
            Goal {target} kg
          </text>
        </>
      )}

      <polyline
        points={line}
        fill="none"
        className="stroke-fg"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {points.map((p, i) => {
        const isLast = i === points.length - 1;
        return (
          <circle
            key={`w-${i}`}
            cx={x(i)}
            cy={y(p.weightKg)}
            r={isLast ? 5 : 3.5}
            className={isLast ? 'fill-brand stroke-brand' : 'fill-surface-1 stroke-fg'}
            strokeWidth="2"
          />
        );
      })}

      <text x={PAD.left} y={H - 8} className="fill-muted text-[11px]">
        {shortDate((startPoint ?? first).loggedOn)}
      </text>
      {points.length > 2 && (
        <text x={W / 2} y={H - 8} textAnchor="middle" className="fill-muted text-[11px]">
          {shortDate(middle.loggedOn)}
        </text>
      )}
      <text x={W - PAD.right} y={H - 8} textAnchor="end" className="fill-muted text-[11px]">
        {shortDate(last.loggedOn)}
      </text>
    </svg>
  );
}
