import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Thead, Tbody, Tr, Th, Td } from "@/components/ui/data-table";
import { auditLog } from "@/lib/demo/admin";

export const metadata: Metadata = { title: "Audit log" };

// Semantic TEXT rides the dark-safe *-text pairs, never the fill hexes (DS §9.1 / AM-01).
const ACTION_TONE: Record<string, string> = {
  APPROVED: "text-success-text",
  REJECTED: "text-danger-text",
  ROLE_ASSIGN: "text-info-text",
  TIER_CHANGE: "text-warning-text",
  THRESHOLD_CHANGE: "text-warning-text",
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
          <DataTable style={{ fontFamily: "var(--font-mono)" }}>
            <Thead className="static">
              <Tr hover={false}>
                {["Time", "Actor", "Role", "Action", "Entity", "Detail"].map((h) => (
                  <Th key={h} className="whitespace-nowrap">
                    {h}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {auditLog.map((e) => (
                <Tr key={e.id}>
                  <Td className="whitespace-nowrap text-muted">{e.at}</Td>
                  <Td className="whitespace-nowrap text-fg">{e.actor}</Td>
                  <Td className="whitespace-nowrap text-muted">{e.role}</Td>
                  <Td className={`whitespace-nowrap font-medium ${ACTION_TONE[e.action] ?? "text-fg"}`}>
                    {e.action}
                  </Td>
                  <Td className="whitespace-nowrap text-fg">{e.entity}</Td>
                  <Td className="text-muted">{e.detail}</Td>
                </Tr>
              ))}
            </Tbody>
          </DataTable>
        </CardContent>
      </Card>
      <p className="max-w-[72ch] text-xs text-muted">
        Tamper-evident (server-only writes, deny update/delete), not cryptographically tamper-proof
        without a WORM export or hash-chain.
      </p>
    </div>
  );
}
