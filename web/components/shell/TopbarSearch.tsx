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
 */
export function TopbarSearch() {
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
      className="relative hidden max-w-sm flex-1 md:block"
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
      {showPanel && (
        <div className="menu-enter absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface shadow-lg">
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
                  <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted">
                    {hit.group}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p role="status" className="px-3 py-4 text-sm text-muted">
              No matches in the seeded dataset.
            </p>
          )}
          <p className="border-t border-[var(--color-border)] px-3 py-2 text-[11px] text-muted">
            Demo-scoped search · seeded members, markets &amp; listings
          </p>
        </div>
      )}
    </div>
  );
}
