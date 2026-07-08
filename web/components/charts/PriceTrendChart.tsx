"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TooltipEntry = { dataKey?: string | number; value?: number | null; color?: string };

const SERIES_COLORS = [
  "var(--data)",
  "var(--series-gold)",
  "var(--series-sky)",
  "var(--series-violet)",
  "var(--series-teal)",
  "var(--series-red)",
];

/**
 * Interactive monthly price-trend line chart (FR-MKT-11). Lazy client island (kept out
 * of shared bundle via dynamic import). Gaps render as gaps — connectNulls is OFF, so
 * unreported months are honest holes, never fabricated continuity. Cadence + provenance
 * shown on the card and in the tooltip ("Monthly · source"), never labelled "live".
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
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "var(--color-muted)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--color-border)" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
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
        {markets.map((m, i) => (
          <Line
            key={m}
            type="monotone"
            dataKey={m}
            stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
            strokeWidth={2.25}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
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
    <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface px-3 py-2 text-xs shadow-[var(--shadow-pop)]">
      <div className="mb-1 font-medium text-fg">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey as string} className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            {p.dataKey}
          </span>
          <span className="tabular font-medium text-fg">
            {p.value == null ? "—" : `${(p.value as number).toLocaleString()} UGX/kg`}
          </span>
        </div>
      ))}
      <div className="mt-1.5 border-t border-[var(--color-border)] pt-1 text-[11px] text-muted">
        Monthly · {source}
      </div>
    </div>
  );
}
