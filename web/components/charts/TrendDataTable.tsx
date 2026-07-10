import { DataTable, Thead, Tbody, Tr, Th, Td } from "@/components/ui/data-table";

/**
 * Accessible data-table alternative for the monthly trend charts (AF-8; 06 A.10):
 * sticky header, tabular-nums, right-aligned numerics, Source + As-of columns always
 * visible, missing observation = "—" (never blank, never zero — gap honesty, DV-04).
 * Built on the shared <DataTable> registry primitives (DS §9.8/AM-24).
 * Server-safe (no hooks) so both the dashboard RSC and the /market island reuse it.
 */
export type TrendTableRow = {
  /** Member-facing period, e.g. "Dec 2025". */
  period: string;
  /** Data vintage for the row (same calendar month for monthly series). */
  asOf: string;
  /** One value per series, aligned with `seriesNames`; null = not reported. */
  values: (number | null)[];
};

export function TrendDataTable({
  seriesNames,
  rows,
  source,
  caption,
}: {
  seriesNames: string[];
  rows: TrendTableRow[];
  source: string;
  caption: string;
}) {
  return (
    <DataTable
      caption={caption}
      containerClassName="max-h-[320px] overflow-auto rounded-[var(--radius-sm)] border border-[var(--color-border)]"
      style={{ minWidth: 220 + seriesNames.length * 96 + 180 }}
    >
      <Thead>
        <Tr hover={false}>
          <Th>Month</Th>
          {seriesNames.map((name) => (
            <Th key={name} align="right">
              {name} (UGX/kg)
            </Th>
          ))}
          <Th>Source</Th>
          <Th>As of</Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <Tr key={row.period}>
            <Th scope="row" className="text-sm font-medium text-fg">
              {row.period}
            </Th>
            {row.values.map((value, i) => (
              <Td key={seriesNames[i]} align="right" tabular className="text-fg">
                {value == null ? (
                  <>
                    <span aria-hidden className="text-muted">
                      —
                    </span>
                    <span className="sr-only">no data</span>
                  </>
                ) : (
                  value.toLocaleString()
                )}
              </Td>
            ))}
            <Td className="text-xs text-muted">{source}</Td>
            <Td tabular className="text-xs text-muted">
              {row.asOf}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </DataTable>
  );
}
