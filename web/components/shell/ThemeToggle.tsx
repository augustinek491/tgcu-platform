"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Theme crossfade (06 PART H.2 row 11; MOT-03): the light↔dark flip crossfades over
 * 200ms ease instead of hard-cutting the whole viewport.
 *
 * Primary path — native View Transitions API (sanctioned native tech): the old frame
 * is snapshotted and crossfaded into the new one; `.theme-vt` on <html> scopes the
 * 200ms/ease timing (globals.css). `[data-crossfade-exempt]` regions (the /market
 * WebGL map island marks itself) are lifted into their own transition layer with
 * animations disabled, so the canvas is excluded from the snapshot pair and never
 * flashes blank.
 *
 * Fallback path (no VT support): `.theme-fade` on <html> eases color/bg/border for
 * ~250ms around the flip — still no hard cut. Exempt regions opt out via CSS.
 *
 * Reduced motion: instant switch (previous behavior) — motion is the enhancement.
 */
type DocumentWithVT = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

function applyThemeWithCrossfade(apply: () => void) {
  const root = document.documentElement;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }
  const doc = document as DocumentWithVT;
  if (typeof doc.startViewTransition === "function") {
    root.classList.add("theme-vt");
    const vt = doc.startViewTransition(() => {
      // next-themes flips the .dark class in an effect; flushSync commits it inside
      // the VT callback so the API captures old/new states correctly.
      flushSync(apply);
    });
    vt.finished.finally(() => root.classList.remove("theme-vt"));
  } else {
    root.classList.add("theme-fade");
    apply();
    window.setTimeout(() => root.classList.remove("theme-fade"), 250);
  }
}

/** Light/dark toggle. SSR-safe: renders a stable placeholder until mounted (no flash). */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      onClick={() => applyThemeWithCrossfade(() => setTheme(isDark ? "light" : "dark"))}
    >
      {mounted && isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
