import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, Thead, Tbody, Tr, Th, Td } from "@/components/ui/data-table";
import { RBAC_ROLES, RBAC_MATRIX } from "@/lib/demo/admin";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Roles & permissions" };

const roleDefs = [
  ["Super-Admin", "Platform owner; role assignment, settings, full audit read."],
  ["Secretariat Staff", "Operate members, content, reports, notifications."],
  ["Data Officer", "Review/approve field submissions; edit prices (audited); thresholds."],
  ["Field Officer", "Enumerator; submits observations; own submissions + scorecard only."],
  ["Org Admin", "Manage own org profile/users/dues; no other-org access."],
  ["Member", "Self-service; read-only for governance matters."],
];

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-fg">Roles &amp; permissions</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            The canonical six-role model, enforced server-side (Auth custom claims + Security Rules) —
            never merely hidden in the UI. Least-privilege by default.
          </p>
        </div>
        <Badge variant="warning">Demo · seeded data</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roleDefs.map(([name, desc]) => (
          <Card key={name} className="p-4">
            <div className="font-medium text-fg">{name}</div>
            <p className="mt-1 text-sm text-muted">{desc}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable>
            <Thead className="static">
              <Tr hover={false}>
                <Th>Capability</Th>
                {RBAC_ROLES.map((r) => (
                  <Th key={r} align="center">
                    {r}
                  </Th>
                ))}
              </Tr>
            </Thead>
            {/* Compact-table cells on the 8px grid (LAY-06/08): py-2 keeps
                rows ≥36 per A.10's compact floor. */}
            <Tbody>
              {RBAC_MATRIX.map((row) => (
                <Tr key={row.capability} hover={false}>
                  <Td className="whitespace-nowrap text-fg">{row.capability}</Td>
                  {row.perms.map((perm, i) => (
                    <Td key={i} align="center">
                      {perm === "—" ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <span
                          className={cn(
                            "inline-block rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium",
                            perm.includes("A") || perm.includes("U") || perm.includes("C")
                              ? "bg-brand-800/10 text-brand-800 dark:bg-brand-600/15 dark:text-brand-300"
                              : "text-muted",
                          )}
                        >
                          {perm}
                        </span>
                      )}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </DataTable>
        </CardContent>
      </Card>
      <p className="max-w-[72ch] text-xs text-muted">
        C = Create · R = Read · U = Update · D = Deactivate · A = Approve/Decide · exp = Export ·
        — = no access.
        Org-scoped rows apply only to the user&apos;s own org.
      </p>
    </div>
  );
}
