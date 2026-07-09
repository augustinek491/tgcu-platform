"use client";

import { useEffect, useState, type HTMLAttributes } from "react";

/**
 * Arms the one-time chart draw-in (06 H.2) AFTER mount, and only when the
 * document is visible. Server HTML therefore always carries the finished
 * chart (LCP, no-JS, hidden tabs and audit screenshots see complete lines);
 * a visible tab replays the 400ms draw once. Reduced-motion is handled in
 * the CSS module (final state, no animation).
 */
export function DrawIn({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!document.hidden) setRun(true);
  }, []);
  return (
    <div {...props} data-draw={run ? "run" : undefined}>
      {children}
    </div>
  );
}
