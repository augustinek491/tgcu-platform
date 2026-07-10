import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TierBadge, StandingBadge } from "@/components/membership/badges";
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
              a.invoice.number,
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
                <Badge key="v" variant="brand">Verified</Badge>
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
  /** Column indexes whose header + cells right-align (06 A.10 numerics rule). */
  numericCols?: number[];
}) {
  // Cell padding 16×12 on-token (LAY-07: 20px is sanctioned as card padding only).
  const alignClass = (j: number) => (numericCols.includes(j) ? "text-right" : "text-left");
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {head.map((h, j) => (
              <th
                key={h}
                className={`whitespace-nowrap px-4 py-3 font-medium text-muted ${alignClass(j)}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[var(--color-border)] transition-colors duration-[var(--dur-fast)] last:border-0 hover:bg-surface-2"
            >
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 align-middle text-fg ${alignClass(j)}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
