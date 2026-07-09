"use client";

import { useState } from "react";

/**
 * Route/page transition (06 PART H.2 row 8; MOT-05): 200ms ease-out opacity + 4px
 * rise on the route content, once per navigation — Next re-mounts a template on
 * every route change inside this group, so the CSS enter animation replays per nav.
 *
 * LCP guard: the very FIRST render of the session (server HTML + hydration pass)
 * renders WITHOUT the animation class — the module-scope flag below only flips on
 * the client — so the initial document paints at full opacity and LCP is never
 * delayed. The enter animation is a client-side-navigation-only enhancement.
 *
 * Reduced motion: `.route-enter` is `animation: none` under
 * `prefers-reduced-motion: reduce` (globals.css) → instant swap, per H.2.
 *
 * Scoped to (app) only: (marketing)/(auth) entrance choreography is owned by the
 * marketing lane and must not be double-animated.
 */
let hasRenderedOnce = false;

export default function AppTemplate({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => {
    // Server render (and the matching hydration render) must agree: no animation.
    if (typeof window === "undefined") return false;
    const shouldAnimate = hasRenderedOnce;
    hasRenderedOnce = true;
    return shouldAnimate;
  });

  return <div className={animate ? "route-enter" : undefined}>{children}</div>;
}
