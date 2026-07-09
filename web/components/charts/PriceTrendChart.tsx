"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { SERIES_COLORS } from "./palette";
import { formatUGXPerKg } from "@/lib/utils";

type TooltipEntry = { dataKey?: string | number; value?: number | null; color?: string };

/**
 * Interactive monthly price-trend chart (FR-MKT-11). Lazy client island (kept out
 * of shared bundle via dynamic import). Honesty + spec rules applied here:
 *  – gaps render as gaps (connectNulls OFF) with a visible "no data" tick (DV-04/16);
 *  – series colors come from the canonical categorical palette, keyed to the same
 *    selection order as the market chips (DV-03/06);
 *  – single series renders as an Area with a 20%→0 gradient fill (DS §6, DV-14);
 *  – draw-in 400ms once, disabled under prefers-reduced-motion (06 H.2);
 *  – axis text 12px Public Sans; grid `--border` @ 60%, horizontal only (DV-10/13/18).
 */
export function PriceTrendChart({
  data,
  markets,
  source,
}: {
  data: Record<string, number | string | null>[];
  markets: string[];
  source: string;
}) {
  // Reduced motion renders the final state instantly (06 H.2). Hidden documents
  // (background tabs, headless capture) skip the draw too — rAF-driven animation
  // would freeze mid-draw and leave the chart blank.
  const animate = useMemo(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !document.hidden,
    [],
  );

  // Months where any plotted series has no observation → visible "no data" tick.
  const gapMonths = useMemo(() => {
    const out: string[] = [];
    for (const row of data) {
      if (markets.some((m) => m in row && row[m] == null)) out.push(String(row.month));
    }
    return out;
  }, [data, markets]);

  const single = markets.length === 1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 16, right: 12, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="trend-single-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--data)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--data)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" strokeOpacity={0.6} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
          tickLine={false}
          minTickGap={20}
          axisLine={{ stroke: "var(--color-border)" }}
        />
        <YAxis
          // Axis ticks are member-facing: Public Sans 12, never mono (DS §3; TYP-05)
          tick={{ fontSize: 12, fill: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(v) => (v as number).toLocaleString()}
        />
        <Tooltip
          content={(p) => (
            <ProvenanceTooltip
              active={p.active}
              label={p.label as string | number}
              payload={p.payload as unknown as TooltipEntry[]}
              source={source}
            />
          )}
        />
        {gapMonths.map((month) => (
          <ReferenceLine
            key={month}
            x={month}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
            label={{
              value: "no data",
              position: "insideTop",
              fontSize: 12,
              fill: "var(--color-muted)",
              fontFamily: "var(--font-sans)",
            }}
          />
        ))}
        {single ? (
          <Area
            type="monotone"
            dataKey={markets[0]}
            stroke="var(--data)"
            strokeWidth={2}
            fill="url(#trend-single-fill)"
            dot={{ r: 3, fill: "var(--data)", strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            connectNulls={false}
            isAnimationActive={animate}
            animationDuration={400}
            animationEasing="ease-out"
          />
        ) : (
          markets.map((m, i) => {
            const color = SERIES_COLORS[i % SERIES_COLORS.length];
            return (
              <Line
                key={m}
                type="monotone"
                dataKey={m}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                connectNulls={false}
                isAnimationActive={animate}
                animationDuration={400}
                animationEasing="ease-out"
              />
            );
          })
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function ProvenanceTooltip({
  active,
  payload,
  label,
  source,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
  source: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="max-w-[calc(100vw-48px)] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface px-3 py-2 text-xs shadow-[var(--shadow-pop)]">
      <div className="mb-1 font-medium text-fg">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey as string} className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            {p.dataKey}
          </span>
          <span className="tabular font-medium text-fg">
            {p.value == null ? (
              <>
                <span aria-hidden>—</span>
                <span className="sr-only">no data</span>
              </>
            ) : (
              formatUGXPerKg(p.value as number)
            )}
          </span>
        </div>
      ))}
      <div className="mt-1.5 border-t border-[var(--color-border)] pt-1 text-xs text-muted">
        Monthly · {source}
      </div>
    </div>
  );
}
