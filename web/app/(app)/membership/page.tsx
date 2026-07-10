import type { Metadata } from "next";
import Link from "next/link";
import { Check, Lock, ArrowUpRight, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { TierBadge, StandingBadge, VerifiedBadge } from "@/components/membership/badges";
import { DuesCard } from "@/components/membership/DuesCard";
import { currentOrg, invoicesForOrg, receiptsForOrg } from "@/lib/demo/membership";
import { tierById } from "@/lib/membership/tiers";
import { hasEntitlement, isVerified } from "@/lib/membership/model";
import { ENTITLEMENT_LABEL, ENTITLEMENT_ORDER } from "@/lib/membership/labels";
import { formatDay, formatUGX } from "@/lib/utils";

export const metadata: Metadata = { title: "Membership" };

export default function MembershipPage() {
  const org = currentOrg();
  const tier = tierById(org.tierId);
  const invoices = invoicesForOrg(org.orgId);
  const receipts = receiptsForOrg(org.orgId);

  const entitlements = ENTITLEMENT_ORDER.map((key) => ({
    key,
    label: ENTITLEMENT_LABEL[key],
    on: hasEntitlement(org, key),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[28px] font-semibold text-fg">
              {org.tradingName ?? org.legalName}
            </h1>
            {isVerified(org) && <VerifiedBadge />}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="capitalize">{org.type}</span> · {org.district} · Member since{" "}
            {new Date(org.memberSince).getFullYear()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="warning">Demo · seeded data</Badge>
          <TierBadge tierId={org.tierId} />
          <StandingBadge standing={org.standing} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Tier & entitlements */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Your tier · {tier.name}</CardTitle>
              <p className="text-sm text-muted">{tier.historyLabel}</p>
            </div>
            {org.tierId !== "platinum" && (
              <Link href="/pricing" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                View tiers <ArrowUpRight className="size-4" />
              </Link>
            )}
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {entitlements.map((e) => (
                <li
                  key={e.key}
                  className={`flex items-start gap-3 rounded-[var(--radius-sm)] px-2 py-2 text-sm ${e.on ? "text-fg" : "text-muted"}`}
                >
                  {e.on ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                  ) : (
                    <Lock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                  )}
                  <span>
                    {e.label}
                    {!e.on && (
                      <Link href="/pricing" className="ml-1 text-brand-700 hover:underline dark:text-brand-300">
                        View tiers
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Standing / renewal summary */}
        <Card>
          <CardHeader>
            <CardTitle>Standing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Status" value={<StandingBadge standing={org.standing} />} />
            <Row label="KYC level" value={`L${org.kycLevel} · ${org.kycLevel >= 2 ? "Member-verified" : "Contact-verified"}`} />
            <Row label="Renewal" value="1 Jan 2027" />
            <Row label="Directory" value={isVerified(org) ? "Listed · verified" : "Listed"} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DuesCard invoices={invoices} />
        </div>

        {/* Receipts */}
        <Card>
          <CardHeader>
            <CardTitle>Receipts</CardTitle>
            <p className="text-sm text-muted">Payment history</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {receipts.map((r) => (
              <div
                key={r.receiptId}
                className="flex items-center justify-between rounded-[var(--radius-sm)] px-2 py-2 transition-colors duration-[var(--dur-fast)] hover:bg-surface-2"
              >
                <div>
                  <div className="text-sm font-medium text-fg">{r.number}</div>
                  <div className="text-xs text-muted">
                    {formatDay(r.date)} · {r.manual ? "recorded manually" : r.method.replace("_", " ")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tabular text-sm text-fg">{formatUGX(r.amountUGX)}</span>
                  <Download className="size-4 text-muted" aria-hidden />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-fg">{value}</span>
    </div>
  );
}
