"use client";

import { useState } from "react";
import { Check, X, RotateCcw, MapPin, Camera, AlertTriangle, CircleCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { submissions as seed, FLAG_LABEL, type FieldSubmission } from "@/lib/demo/admin";

type Decision = "APPROVED" | "REJECTED" | "RETURNED";

/**
 * Field-data verification queue (FR-ADM-05/07/08/09). Nothing enters trusted data
 * except via an explicit human APPROVE — no time-out self-publish (fail-closed).
 * Reject/return require a reason. Provenance, screening flags and the external
 * cross-check delta are surfaced so reviewers focus on suspect values.
 */
export function VerificationQueue() {
  const [items, setItems] = useState<FieldSubmission[]>(seed);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const pending = items.filter((s) => !decisions[s.id]);

  function decide(id: string, d: Decision) {
    setDecisions((prev) => ({ ...prev, [id]: d }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <Stat label="Pending review" value={pending.length} />
        <Stat label="Approved (session)" value={Object.values(decisions).filter((d) => d === "APPROVED").length} tone="success" />
        <Stat label="Rejected / returned" value={Object.values(decisions).filter((d) => d !== "APPROVED").length} tone="danger" />
      </div>

      {pending.length === 0 ? (
        <Card className="p-10 text-center">
          <CircleCheck className="mx-auto size-8 text-[var(--color-success)]" />
          <p className="mt-2 font-medium text-fg">Queue clear</p>
          <p className="text-sm text-muted">Every submission has a recorded decision. Nothing self-publishes.</p>
        </Card>
      ) : (
        pending.map((s) => {
          const delta = s.benchmark ? ((s.priceUGXPerKg - s.benchmark.value) / s.benchmark.value) * 100 : null;
          const bigDelta = delta != null && Math.abs(delta) > 40;
          return (
            <Card key={s.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-semibold text-fg">
                      {s.commodity} · {s.market}
                    </span>
                    <span className="tabular text-lg font-semibold text-fg">
                      {s.priceUGXPerKg.toLocaleString()} <span className="text-sm font-normal text-muted">UGX/kg</span>
                    </span>
                    <Badge variant="neutral">{s.id}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span>Officer: <span className="text-fg">{s.officer}</span></span>
                    <span className={cn(s.officerAccuracy < 80 && "text-[var(--color-warning)]")}>
                      {s.officerAccuracy}% approval rate
                    </span>
                    <span>Observed {s.observationDate} · submitted {s.submittedAt}</span>
                  </div>
                </div>
              </div>

              {/* Provenance + screening */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip icon={MapPin} on={!!s.geo} label={s.geo ? "Geo captured" : "Location not captured"} warn={!s.geo} />
                <Chip icon={Camera} on={s.hasPhoto} label={s.hasPhoto ? "Photo attached" : "No photo"} />
                {s.flags.map((f) => (
                  <Chip key={f} icon={AlertTriangle} on={false} label={FLAG_LABEL[f]} warn />
                ))}
                {s.flags.length === 0 && s.geo && (
                  <Chip icon={CircleCheck} on label="Clean screen" />
                )}
              </div>

              {/* Cross-check */}
              <div className="mt-3 rounded-[var(--radius-sm)] bg-surface-2 p-2.5 text-xs">
                {s.benchmark ? (
                  <span className="text-muted">
                    External cross-check:{" "}
                    <span className="text-fg">{s.benchmark.value.toLocaleString()} UGX/kg</span> ·{" "}
                    {s.benchmark.source} · {s.benchmark.date} ·{" "}
                    <span className={cn("font-medium", bigDelta ? "text-[var(--color-danger)]" : "text-[var(--color-success)]")}>
                      {delta! >= 0 ? "+" : ""}
                      {delta!.toFixed(0)}% vs submitted
                    </span>
                  </span>
                ) : (
                  <span className="text-muted">No external benchmark available for this commodity/period.</span>
                )}
              </div>

              {/* Decision */}
              <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-3">
                <Button size="sm" onClick={() => decide(s.id, "APPROVED")}>
                  <Check className="size-4" /> Approve &amp; publish
                </Button>
                <Button size="sm" variant="secondary" onClick={() => decide(s.id, "RETURNED")}>
                  <RotateCcw className="size-4" /> Return for correction
                </Button>
                <Button size="sm" variant="ghost" onClick={() => decide(s.id, "REJECTED")}>
                  <X className="size-4" /> Reject
                </Button>
                <span className="ml-auto self-center text-[11px] text-muted">
                  Reject / return records a mandatory reason &amp; notifies the officer.
                </span>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "danger" }) {
  const color = tone === "success" ? "text-[var(--color-success)]" : tone === "danger" ? "text-[var(--color-danger)]" : "text-fg";
  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-1.5">
      <span className={cn("tabular font-semibold", color)}>{value}</span>{" "}
      <span className="text-muted">{label}</span>
    </div>
  );
}

function Chip({
  icon: Icon,
  label,
  on,
  warn,
}: {
  icon: typeof MapPin;
  label: string;
  on: boolean;
  warn?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs",
        warn
          ? "bg-[var(--color-warning)]/12 text-[var(--color-warning)]"
          : on
            ? "bg-[var(--color-success)]/12 text-[var(--color-success)]"
            : "bg-surface-2 text-muted",
      )}
    >
      <Icon className="size-3" /> {label}
    </span>
  );
}
