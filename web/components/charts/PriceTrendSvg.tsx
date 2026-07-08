import { priceTrend } from "@/lib/demo/data";

/**
 * Server-rendered SVG price-trend line (LCP is text/vector, not a spinner). The
 * interactive Recharts island (hover/zoom) arrives with the Market-Data module slice;
 * this proves the shell with an accessible, honest static render + data-table fallback.
 */
export function PriceTrendSvg() {
  const { months, series, ariaLabel } = priceTrend;
  const W = 620;
  const H = 240;
  const padL = 46;
  const padR = 14;
  const padT = 20;
  const padB = 34;
  const all = series.flatMap((s) => s.points);
  const min = Math.floor(Math.min(...all) / 100) * 100;
  const max = Math.ceil(Math.max(...all) / 100) * 100;
  const range = max - min || 1;
  const x = (i: number) => padL + (i / (months.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - min) / range) * (H - padT - padB);

  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => min + f * range);

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={ariaLabel}>
        {gridVals.map((v, i) => (
          <g key={i} aria-hidden>
            <line
              x1={padL}
              y1={y(v)}
              x2={W - padR}
              y2={y(v)}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text x={6} y={y(v) + 4} fontSize="11" fontFamily="var(--font-mono)" fill="var(--color-muted)">
              {Math.round(v)}
            </text>
          </g>
        ))}
        {months.map((m, i) => (
          <text
            key={m}
            x={x(i)}
            y={H - 12}
            fontSize="11"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fill="var(--color-muted)"
            aria-hidden
          >
            {m}
          </text>
        ))}
        {series.map((s) => (
          <g key={s.name}>
            <polyline
              points={s.points.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={x(months.length - 1)} cy={y(s.points.at(-1)!)} r="3.5" fill={s.color} />
          </g>
        ))}
      </svg>
      <figcaption className="sr-only">
        Data table alternative: {series.map((s) => `${s.name} ends at ${s.points.at(-1)} UGX/kg`).join("; ")}.
      </figcaption>
    </figure>
  );
}
