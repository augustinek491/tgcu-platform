"use client";

import { useState } from "react";
import { Check, Loader2, Smartphone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDay, formatUGX } from "@/lib/utils";
import type { Invoice } from "@/lib/membership/model";

type PayState = "idle" | "initiated" | "awaiting" | "success";

/**
 * Dues + pay island. Simulates the provider-agnostic gateway state machine
 * (initiated → awaiting approval → success) with an explicit terminal state — no
 * fake-data shortcut, no dead-end (FR-MEM-21/52). Live processing is [DEMO-STUB ok];
 * a real adapter (Flutterwave/DPO/iOTec/card/MoMo) or the manual path swaps in unchanged.
 */
export function DuesCard({ invoices }: { invoices: Invoice[] }) {
  const [paid, setPaid] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<string | null>(null);
  const [state, setState] = useState<PayState>("idle");

  const outstanding = invoices.filter(
    (i) => (i.status === "issued" || i.status === "overdue" || i.status === "part_paid") && !paid[i.invoiceId],
  );

  async function pay(inv: Invoice) {
    setActive(inv.invoiceId);
    setState("initiated");
    await wait(600);
    setState("awaiting");
    await wait(1200);
    setState("success");
    await wait(700);
    setPaid((p) => ({ ...p, [inv.invoiceId]: true }));
    setActive(null);
    setState("idle");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dues & invoices</CardTitle>
        <p className="text-sm text-muted">
          Amounts illustrative — tier pricing announced at launch.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {invoices.map((inv) => {
          const isPaid = inv.status === "paid" || paid[inv.invoiceId];
          const isActive = active === inv.invoiceId;
          return (
            <div
              key={inv.invoiceId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-fg">{inv.number}</span>
                  {isPaid ? (
                    <Badge variant="success">Paid</Badge>
                  ) : inv.status === "overdue" ? (
                    <Badge variant="danger">Overdue</Badge>
                  ) : (
                    <Badge variant="warning">Issued</Badge>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  {inv.periodLabel} · due {formatDay(inv.dueDate)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular text-sm font-semibold text-fg">
                  {formatUGX(inv.amountUGX)}
                </span>
                {!isPaid &&
                  (isActive ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 dark:text-brand-500">
                      {state === "success" ? (
                        <Check className="size-4" />
                      ) : (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      {state === "initiated" && "Initiating…"}
                      {state === "awaiting" && "Approve on handset…"}
                      {state === "success" && "Paid"}
                    </span>
                  ) : (
                    <Button size="sm" onClick={() => pay(inv)} disabled={!!active}>
                      <Smartphone className="size-4" /> Pay
                    </Button>
                  ))}
              </div>
            </div>
          );
        })}
        {outstanding.length === 0 && (
          <p className="rounded-[var(--radius-sm)] bg-[var(--color-success)]/10 p-3 text-sm text-[var(--color-success)]">
            All dues settled — you&apos;re in good standing.
          </p>
        )}
        <p className="pt-1 text-xs text-muted">
          Demo gateway (sandbox). Secretariat can also record cash / bank / offline mobile-money
          payments manually — dues work with no live gateway.
        </p>
      </CardContent>
    </Card>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
