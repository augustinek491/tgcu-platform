import Link from "next/link";
import { LineChart, Users, Store, ShieldCheck, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/Logo";

const modules = [
  {
    icon: Users,
    title: "Membership & Identity",
    body: "One system of record for 400+ member organisations — tiers, dues and defaulter management, replacing scattered spreadsheets.",
  },
  {
    icon: LineChart,
    title: "Market Data & Analytics",
    body: "Honest grain-price dashboards with provenance and freshness on every point — trends, comparisons and a national commodities map.",
  },
  {
    icon: Store,
    title: "Marketplace",
    body: "Asset-light listings, offers and escrow-backed trade between verified members, with goods-in-transit tracking.",
  },
  {
    icon: ShieldCheck,
    title: "Admin & Governance",
    body: "Field-data verification, role-based access and an immutable audit trail — trust built into every write.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1200px] px-5 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <LogoMark size={64} />
          </div>
          <Badge variant="brand" className="mb-5">
            Making Uganda the region&apos;s grain basket
          </Badge>
          <h1 className="font-display text-4xl font-semibold leading-tight text-fg md:text-5xl">
            The digital home of Uganda&apos;s grain industry
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Membership, market intelligence and a trusted grain marketplace — one platform
            for producers, traders, processors, millers and exporters.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className={buttonVariants({ size: "lg" })}>
              Sign in <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              View membership tiers
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 pb-24">
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.title} className="p-6">
                <div className="mb-4 grid size-11 place-items-center rounded-[var(--radius-sm)] bg-brand-800/10 text-brand-700 dark:bg-brand-600/15 dark:text-brand-500">
                  <Icon className="size-5" />
                </div>
                <h2 className="font-display text-xl font-semibold text-fg">{m.title}</h2>
                <p className="mt-2 text-sm text-muted">{m.body}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
