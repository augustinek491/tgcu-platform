"use client";

import { useEffect, useMemo, useState } from "react";
import { ListingCard } from "./ListingCard";
import { OfferDialog, type OfferDraft } from "./OfferDialog";
import { GrainBasketIllustration } from "@/components/illustrations/empty-states";
import { cn } from "@/lib/utils";
import { LISTINGS } from "@/lib/demo/marketplace";
import { GRADE_LABEL, type Grade, type Listing, type ListingType } from "@/lib/marketplace/model";

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

/** sessionStorage key for recorded sandbox offers (FLOW-R2-02 / CON-R2-03): the offer
 * dialog promises "recorded in your session only" — persisting for the browser
 * session (and no longer) is what makes that copy literally true across navigation. */
const OFFERS_KEY = "tgcu-demo-offers";

function loadOffers(): Record<string, OfferDraft> {
  try {
    const raw = window.sessionStorage.getItem(OFFERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, OfferDraft>) : {};
  } catch {
    return {};
  }
}

function persistOffers(offers: Record<string, OfferDraft>) {
  try {
    window.sessionStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
  } catch {
    // Storage unavailable (private mode etc.) — offers stay page-local, still sandbox.
  }
}

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
  // FLOW-02: offer dialog + recorded offers. Session-only demo-sandbox state that
  // truly lasts the browser session: hydrated from sessionStorage after mount (SSR
  // renders none, so markup matches), written back on every change.
  const [offerFor, setOfferFor] = useState<Listing | null>(null);
  const [offers, setOffers] = useState<Record<string, OfferDraft>>({});
  useEffect(() => {
    setOffers(loadOffers());
  }, []);

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
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      {/* Filter rail */}
      <aside className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-fg">Filters</span>
          <button
            onClick={clear}
            className="inline-flex min-h-11 items-center px-2 text-xs text-brand-interactive hover:underline lg:min-h-0 lg:px-0"
          >
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
              <ListingCard
                key={l.listingId}
                listing={l}
                sentOffer={offers[l.listingId]}
                onAction={setOfferFor}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-10 text-center">
            <GrainBasketIllustration className="mx-auto mb-3" />
            <p className="font-medium text-fg">No listings match these filters</p>
            <p className="mt-1 text-sm text-muted">Try relaxing a filter.</p>
            <button
              onClick={clear}
              className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-brand-interactive hover:underline lg:min-h-0"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {offerFor && (
        <OfferDialog
          listing={offerFor}
          initial={offers[offerFor.listingId]}
          onClose={() => setOfferFor(null)}
          onSubmit={(draft) => {
            const next = { ...offers, [offerFor.listingId]: draft };
            setOffers(next);
            persistOffers(next);
            setOfferFor(null);
          }}
        />
      )}
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
          aria-pressed={value === o.v}
          className={cn(
            // min-h-11 = 44px touch target <lg (MOB-03); desktop keeps the compact control.
            "min-h-11 flex-1 px-2 py-2 text-xs font-medium transition-colors lg:min-h-0",
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
    <div className="space-y-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={cn(
            "flex min-h-11 w-full items-center rounded-[var(--radius-sm)] px-2 py-1 text-left text-sm transition-colors lg:min-h-0",
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
    <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-fg lg:min-h-0">
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
