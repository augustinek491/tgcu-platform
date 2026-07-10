"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchSeeded, type SearchHit } from "@/lib/demo/search";

/**
 * Global search (FLOW-05) — executes against the canonical seeded dataset
 * (members, markets, listings) with a keyboard-navigable combobox. Honestly
 * demo-scoped: the panel says so, and results deep-link to the module pages.
 * `className` lets non-topbar hosts (the 404 page, 01 §6.7) override the
 * topbar-only visibility defaults. No-match state offers actions (CON-R2-08).
 */
export function TopbarSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => searchSeeded(q), [q]);
  const showPanel = open && q.trim().length > 0;

  function go(hit: SearchHit) {
    setOpen(false);
    router.push(hit.href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length > 0) {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && showPanel && results[active]) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      if (open) setOpen(false);
      else setQ("");
    }
  }

  return (
    <div
      className={cn("relative hidden max-w-sm flex-1 md:block", className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={results.length > 0 ? "topbar-search-results" : undefined}
        aria-activedescendant={showPanel && results[active] ? `topbar-search-option-${active}` : undefined}
        aria-autocomplete="list"
        placeholder="Search members, markets, listings…"
        aria-label="Search seeded members, markets and listings"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(e.target.value.trim().length > 0);
          setActive(0);
        }}
        onFocus={() => {
          if (q.trim().length > 0) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-bg pl-9 pr-3 text-base placeholder:text-muted focus-visible:border-ring"
      />
      {/* z-20 = dropdown layer per DS §4 (LAY-13: 30 is the overlay role) */}
      {showPanel && (
        <div className="menu-enter absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface shadow-lg">
          {results.length > 0 ? (
            <ul
              id="topbar-search-results"
              role="listbox"
              aria-label="Search results from seeded data"
              className="max-h-80 overflow-y-auto"
            >
              {results.map((hit, i) => (
                <li
                  key={hit.id}
                  id={`topbar-search-option-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    go(hit);
                  }}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3 py-2 transition-colors duration-[var(--dur-fast)]",
                    i === active && "bg-surface-2",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fg">{hit.label}</span>
                    <span className="block truncate text-xs text-muted">{hit.sub}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted">
                    {hit.group}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-sm">
              <p role="status" className="text-muted">
                No matches in the seeded dataset. Try &ldquo;Aponye&rdquo;, &ldquo;Gulu&rdquo; or{" "}
                &ldquo;maize&rdquo;.
              </p>
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/marketplace");
                  }}
                  className="font-medium text-brand-interactive hover:underline"
                >
                  Browse marketplace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push("/admin/members");
                  }}
                  className="font-medium text-brand-interactive hover:underline"
                >
                  View members
                </button>
              </p>
            </div>
          )}
          <p className="border-t border-[var(--color-border)] px-3 py-2 text-xs text-muted">
            Demo-scoped search · seeded members, markets &amp; listings
          </p>
        </div>
      )}
    </div>
  );
}
