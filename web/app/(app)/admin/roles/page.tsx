import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-4 py-3 text-left font-medium text-muted">Capability</th>
                  {RBAC_ROLES.map((r) => (
                    <th key={r} className="px-3 py-3 text-center text-xs font-medium text-muted">
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RBAC_MATRIX.map((row) => (
                  <tr key={row.capability} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="whitespace-nowrap px-4 py-2.5 text-fg">{row.capability}</td>
                    {row.perms.map((perm, i) => (
                      <td key={i} className="px-3 py-2.5 text-center">
                        {perm === "—" ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <span
                            className={cn(
                              "inline-block rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium",
                              perm.includes("A") || perm.includes("U") || perm.includes("C")
                                ? "bg-brand-800/10 text-brand-800 dark:bg-brand-600/15 dark:text-brand-300"
                                : "text-muted",
                            )}
                          >
                            {perm}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted">
        C = Create · R = Read · U = Update · D = Deactivate · A = Approve/Decide · exp = Export ·
        — = no access.
        Org-scoped rows apply only to the user&apos;s own org.
      </p>
    </div>
  );
}
