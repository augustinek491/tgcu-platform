import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auditLog } from "@/lib/demo/admin";

export const metadata: Metadata = { title: "Audit log" };

const ACTION_TONE: Record<string, string> = {
  APPROVED: "text-[var(--color-success)]",
  REJECTED: "text-[var(--color-danger)]",
  ROLE_ASSIGN: "text-[var(--color-info)]",
  TIER_CHANGE: "text-[var(--color-warning)]",
  THRESHOLD_CHANGE: "text-[var(--color-warning)]",
};

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-fg">Audit log</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Every state-changing admin &amp; data action, append-only.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="warning">Demo · seeded data</Badge>
          <Badge variant="neutral">
            <Lock className="size-3" /> Append-only · update/delete denied
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-mono)" }}>
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left">
                  {["Time", "Actor", "Role", "Action", "Entity", "Detail"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 font-medium text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLog.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-[var(--color-border)] transition-colors duration-[var(--dur-fast)] last:border-0 hover:bg-surface-2"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted">{e.at}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-fg">{e.actor}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted">{e.role}</td>
                    <td className={`whitespace-nowrap px-4 py-2.5 font-medium ${ACTION_TONE[e.action] ?? "text-fg"}`}>
                      {e.action}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-fg">{e.entity}</td>
                    <td className="px-4 py-2.5 text-muted">{e.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted">
        Tamper-evident (server-only writes, deny update/delete), not cryptographically tamper-proof
        without a WORM export or hash-chain.
      </p>
    </div>
  );
}
