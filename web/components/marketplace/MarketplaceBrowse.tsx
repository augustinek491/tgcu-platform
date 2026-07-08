"use client";

import { useMemo, useState } from "react";
import { ListingCard } from "./ListingCard";
import { cn } from "@/lib/utils";
import { LISTINGS } from "@/lib/demo/marketplace";
import { GRADE_LABEL, type Grade, type ListingType } from "@/lib/marketplace/model";

type Filters = {
  type: ListingType | "all";
  commodity: string;
  grade: Grade | "any";
  region: string;
  verifiedOnly: boolean;
  openToOffers: boolean;
};

const COMMODITIES = ["Maize", "Beans", "Rice", "Sorghum"];
const REGIONS = ["Central", "Eastern", "Western", "Northern"];
const GRADES: Grade[] = ["EAS2-Grade1", "EAS2-Grade2", "EAS2-Grade3", "ungraded"];

/** Browse + filter island. Filters are equalities + verified/open toggles (the
 * Firestore-supported set, FR-MKTPL-10). Honest empty state, never a dead-end. */
export function MarketplaceBrowse() {
  const [f, setF] = useState<Filters>({
    type: "all",
    commodity: "all",
    grade: "any",
    region: "all",
    verifiedOnly: false,
    openToOffers: false,
  });

  const results = useMemo(
    () =>
      LISTINGS.filter((l) => {
        if (f.type !== "all" && l.type !== f.type) return false;
        if (f.commodity !== "all" && l.commodity !== f.commodity) return false;
        if (f.grade !== "any" && l.grade !== f.grade) return false;
        if (f.region !== "all" && l.region !== f.region) return false;
        if (f.verifiedOnly && !l.seller.verified) return false;
        if (f.openToOffers && l.priceUGXPerKg !== null) return false;
        return true;
      }),
    [f],
  );

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }));
  const clear = () =>
    setF({ type: "all", commodity: "all", grade: "any", region: "all", verifiedOnly: false, openToOffers: false });

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      {/* Filter rail */}
      <aside className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-fg">Filters</span>
          <button onClick={clear} className="text-xs text-brand-700 hover:underline dark:text-brand-500">
            Clear all
          </button>
        </div>

        <FilterGroup label="Type">
          <Segmented
            options={[
              { v: "all", l: "All" },
              { v: "sell", l: "Sell" },
              { v: "buy", l: "Buy" },
            ]}
            value={f.type}
            onChange={(v) => set("type", v as Filters["type"])}
          />
        </FilterGroup>

        <FilterGroup label="Commodity">
          <Radio options={["all", ...COMMODITIES]} value={f.commodity} labelFor={(v) => (v === "all" ? "All" : v)} onChange={(v) => set("commodity", v)} />
        </FilterGroup>

        <FilterGroup label="Grade (EAS 2)">
          <Radio
            options={["any", ...GRADES]}
            value={f.grade}
            labelFor={(v) => (v === "any" ? "Any grade" : GRADE_LABEL[v as Grade])}
            onChange={(v) => set("grade", v as Filters["grade"])}
          />
        </FilterGroup>

        <FilterGroup label="Region">
          <Radio options={["all", ...REGIONS]} value={f.region} labelFor={(v) => (v === "all" ? "All of Uganda" : v)} onChange={(v) => set("region", v)} />
        </FilterGroup>

        <div className="space-y-2">
          <Check label="Verified sellers only" checked={f.verifiedOnly} onChange={(v) => set("verifiedOnly", v)} />
          <Check label="Open to offers" checked={f.openToOffers} onChange={(v) => set("openToOffers", v)} />
        </div>
      </aside>

      {/* Results */}
      <div>
        <div className="mb-3 text-sm text-muted">
          <span className="font-medium text-fg">{results.length}</span> of {LISTINGS.length} shown
          {f.commodity !== "all" && ` · ${f.commodity}`}
        </div>
        {results.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((l) => (
              <ListingCard key={l.listingId} listing={l} />
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-10 text-center">
            <p className="font-medium text-fg">No listings match these filters</p>
            <p className="mt-1 text-sm text-muted">Try relaxing a filter.</p>
            <button onClick={clear} className="mt-4 text-sm font-medium text-brand-700 hover:underline dark:text-brand-500">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { v: T; l: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)]">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "flex-1 px-2 py-1.5 text-xs font-medium transition-colors",
            value === o.v ? "bg-brand-800 text-white" : "text-muted hover:bg-surface-2",
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Radio({
  options,
  value,
  onChange,
  labelFor,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  labelFor: (v: string) => string;
}) {
  return (
    <div className="space-y-0.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "block w-full rounded-[var(--radius-sm)] px-2 py-1 text-left text-sm transition-colors",
            value === o ? "bg-brand-800/10 font-medium text-brand-800 dark:bg-brand-600/15 dark:text-brand-300" : "text-muted hover:bg-surface-2",
          )}
        >
          {labelFor(o)}
        </button>
      ))}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--color-primary)]"
      />
      {label}
    </label>
  );
}
