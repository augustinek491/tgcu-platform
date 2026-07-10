import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TierBadge, StandingBadge } from "@/components/membership/badges";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { DataTable, Thead, Tbody, Tr, Th, Td } from "@/components/ui/data-table";
import { orgs, arrears, invoicesForOrg } from "@/lib/demo/membership";
import { isVerified } from "@/lib/membership/model";
import { formatUGX } from "@/lib/utils";

export const metadata: Metadata = { title: "Members" };

export default function AdminMembersPage() {
  const arr = arrears();
  const totalOutstanding = arr.reduce((s, a) => s + a.outstanding, 0);
  const inGrace = orgs.filter((o) => o.standing === "grace").length;
  const suspended = orgs.filter((o) => o.standing === "suspended" || o.standing === "lapsed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-fg">Members</h1>
          <p className="mt-1 text-sm text-muted">
            Directory / CRM and arrears — one system of record, replacing Excel + WhatsApp.
          </p>
        </div>
        <Badge variant="warning">Demo · seeded data</Badge>
      </div>

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-4">
        <Summary label="Member organisations" value={String(orgs.length)} caption="directory sample · 10 orgs seeded" />
        <Summary label="In grace" value={String(inGrace)} caption="dues overdue, full access" tone="warn" />
        <Summary label="Suspended / lapsed" value={String(suspended)} caption="past grace" tone="danger" />
        <Summary
          label="Outstanding"
          value={formatUGX(totalOutstanding)}
          caption="illustrative amounts"
        />
      </section>

      {/* Arrears */}
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <AlertTriangle className="size-4 text-warning-text" />
          <CardTitle>Arrears — auto-flagged ≤24h after due date</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            head={["Organisation", "Tier", "Invoice", "Outstanding", "Days overdue", "Standing"]}
            // Money + counts right-aligned tabular per 06 A.10 (LAY-05).
            numericCols={[3, 4]}
            rows={arr.map((a) => [
              a.org.legalName,
              <TierBadge key="t" tierId={a.org.tierId} />,
              <span key="inv" className="font-mono text-xs">{a.invoice.number}</span>,
              <span key="o" className="tabular font-medium">{formatUGX(a.outstanding)}</span>,
              <span key="d" className="tabular">{a.days}</span>,
              <StandingBadge key="s" standing={a.org.standing} />,
            ])}
          />
        </CardContent>
      </Card>

      {/* Directory */}
      <Card>
        <CardHeader>
          <CardTitle>Member directory</CardTitle>
          <p className="text-sm text-muted">{orgs.length} organisations</p>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            head={["Organisation", "Type", "District", "Commodities", "Tier", "Standing", "Verified"]}
            rows={orgs.map((o) => [
              <div key="n">
                <div className="font-medium text-fg">{o.legalName}</div>
                <div className="text-xs text-muted">{o.contactName} · {o.phone}</div>
              </div>,
              <span key="ty" className="capitalize">{o.type}</span>,
              o.district,
              o.commodities.join(", "),
              <TierBadge key="ti" tierId={o.tierId} />,
              <StandingBadge key="st" standing={o.standing} />,
              isVerified(o) ? (
                <VerifiedBadge key="v" />
              ) : (
                <span key="v" className="text-muted">—</span>
              ),
            ])}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Summary({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  tone?: "warn" | "danger";
}) {
  // Semantic TEXT rides the dark-safe *-text pairs (DS §9.1 / AM-01); stat numerals are
  // Public Sans + tabular — serif is reserved for the flagship KPI (DS §3).
  const color =
    tone === "warn" ? "text-warning-text" : tone === "danger" ? "text-danger-text" : "text-fg";
  return (
    <Card className="p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className={`tabular mt-1 text-2xl font-semibold ${color}`}>{value}</div>
      <div className="mt-1 text-xs text-muted">{caption}</div>
    </Card>
  );
}

function Table({
  head,
  rows,
  numericCols = [],
}: {
  head: string[];
  rows: React.ReactNode[][];
  /** Column indexes whose header + cells right-align + go tabular (06 A.10 numerics rule). */
  numericCols?: number[];
}) {
  // Built on the shared <DataTable> registry primitives (DS §9.8/AM-24): ONE th
  // convention (px-3 py-2 · font-semibold), numeric columns right-aligned + tabular.
  const align = (j: number): "left" | "right" => (numericCols.includes(j) ? "right" : "left");
  return (
    <DataTable>
      <Thead className="static">
        <Tr hover={false}>
          {head.map((h, j) => (
            <Th key={h} align={align(j)} className="whitespace-nowrap">
              {h}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row, i) => (
          <Tr key={i}>
            {row.map((cell, j) => (
              <Td
                key={j}
                align={align(j)}
                tabular={numericCols.includes(j)}
                className="align-middle text-fg"
              >
                {cell}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </DataTable>
  );
}
