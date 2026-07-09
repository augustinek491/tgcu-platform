import { priceTrend } from "@/lib/demo/data";
import { DrawIn } from "./DrawIn";
import styles from "./draw.module.css";

/**
 * Server-rendered price-trend line (LCP is text/vector, not a spinner). The plot is a
 * percent-space SVG that stretches to the card while axis text, dots, end-labels and
 * the gap annotation render as HTML — so tick text is real 12px at every breakpoint
 * (DV-10; the old fixed-viewBox render scaled ticks to 5.2px at 375). Heights follow
 * the A.6 matrix 200/240/320 (DV-15). Null months break the line and carry a visible
 * "no data" annotation — never fabricated continuity (FR-MKT-11, DV-04). Draw-in is
 * 400ms once via `--dur-draw`; reduced motion renders the final state (06 H.2).
 */
const PLOT_HEIGHTS = "h-[200px] sm:h-[240px] lg:h-[320px]";

const tickLabel = (m: { label: string; year: number }) => `${m.label} '${String(m.year).slice(-2)}`;
const fullLabel = (m: { label: string; year: number }) => `${m.label} ${m.year}`;

export function PriceTrendSvg() {
  const { months, series, ariaLabel, gapNote } = priceTrend;
  const n = months.length;
  const all = series.flatMap((s) => s.points).filter((v): v is number => v != null);
  const min = Math.floor(Math.min(...all) / 100) * 100;
  const max = Math.ceil(Math.max(...all) / 100) * 100;
  const range = max - min || 1;
  const px = (i: number) => (i / (n - 1)) * 100;
  const py = (v: number) => (1 - (v - min) / range) * 100;

  const gridVals = [1, 0.75, 0.5, 0.25, 0].map((f) => min + f * range);

  // Month indices where at least one series has no observation (gap honesty cue).
  const gapIdx = [...new Set(series.flatMap((s) => s.points.flatMap((v, i) => (v == null ? [i] : []))))];

  return (
    <figure className="m-0">
      <DrawIn className="flex gap-2">
        {/* Y axis — real HTML text, 12px at every breakpoint */}
        <div className={`relative w-10 shrink-0 ${PLOT_HEIGHTS}`} aria-hidden>
          {gridVals.map((v) => (
            <span
              key={v}
              className="tabular absolute right-0 -translate-y-1/2 text-xs text-muted"
              style={{ top: `${py(v)}%` }}
            >
              {Math.round(v).toLocaleString()}
            </span>
          ))}
        </div>

        {/* Plot — percent-space SVG stretched to the card */}
        <div className={`relative min-w-0 flex-1 ${PLOT_HEIGHTS}`}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            role="img"
            aria-label={ariaLabel}
          >
            {gridVals.map((v) => (
              <line
                key={v}
                x1="0"
                x2="100"
                y1={py(v)}
                y2={py(v)}
                stroke="var(--color-border)"
                strokeOpacity="0.6"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {series.map((s) => {
              // Split into contiguous segments so a null month renders as a gap.
              const segments: string[][] = [];
              let current: string[] = [];
              s.points.forEach((v, i) => {
                if (v == null) {
                  if (current.length > 0) segments.push(current);
                  current = [];
                } else {
                  current.push(`${px(i)},${py(v)}`);
                }
              });
              if (current.length > 0) segments.push(current);
              return (
                <g key={s.name}>
                  {segments.map((pts, si) => (
                    <polyline
                      key={si}
                      points={pts.join(" ")}
                      fill="none"
                      stroke={s.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      className={styles.draw}
                    />
                  ))}
                </g>
              );
            })}
          </svg>

          {/* Gap annotation — visible "no data" cue at the break (DV-04/16) */}
          {gapIdx.map((i) => (
            <span key={i} aria-hidden>
              <span
                className="absolute inset-y-0 border-l border-dashed border-[var(--color-border)]"
                style={{ left: `${px(i)}%` }}
              />
              <span
                className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-pill)] bg-surface-2 px-1.5 py-0.5 text-xs text-muted"
                style={{ left: `${px(i)}%` }}
              >
                no data ({fullLabel(months[i])})
              </span>
            </span>
          ))}

          {/* Point dots — HTML so they never distort when the plot stretches */}
          {series.flatMap((s) =>
            s.points.flatMap((v, i) =>
              v == null
                ? []
                : [
                    <span
                      key={`${s.name}-${i}`}
                      aria-hidden
                      className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{ left: `${px(i)}%`, top: `${py(v)}%`, background: s.color }}
                    />,
                  ],
            ),
          )}
        </div>

        {/* End labels — readable without color (A.6); rail hidden on the narrowest screens */}
        <div className={`relative hidden w-16 shrink-0 sm:block ${PLOT_HEIGHTS}`} aria-hidden>
          {series.map((s) => {
            const lastIdx = s.points.reduce<number>((acc, v, i) => (v != null ? i : acc), -1);
            if (lastIdx < 0) return null;
            return (
              <span
                key={s.name}
                className="absolute -translate-y-1/2 text-xs font-medium"
                style={{ top: `${py(s.points[lastIdx] as number)}%`, color: s.color }}
              >
                {s.name}
              </span>
            );
          })}
        </div>
      </DrawIn>

      {/* X axis — real HTML text, 12px; thinned ticks below lg instead of shrinking */}
      <div className="mt-1.5 flex gap-2" aria-hidden>
        <div className="w-10 shrink-0" />
        <div className="relative h-4 min-w-0 flex-1">
          {months.map((m, i) => {
            const always = i % 3 === 0 || i === n - 1;
            return (
              <span
                key={`${m.label}-${m.year}`}
                className={`tabular absolute -translate-x-1/2 whitespace-nowrap text-xs text-muted ${
                  always ? "" : "hidden lg:inline"
                }`}
                style={{ left: `${px(i)}%` }}
              >
                {tickLabel(m)}
              </span>
            );
          })}
        </div>
        <div className="hidden w-16 shrink-0 sm:block" />
      </div>

      <figcaption className="sr-only">
        {series
          .map((s) => {
            const last = [...s.points].reverse().find((v): v is number => v != null);
            return `${s.name} ends at UGX ${last?.toLocaleString() ?? "—"}/kg`;
          })
          .join("; ")}
        .{gapNote ? ` ${gapNote}` : ""} A full month-by-month data table is available via the
        Table view control.
      </figcaption>
    </figure>
  );
}
