"use client";

import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { WheatSheafIllustration } from "@/components/illustrations/empty-states";

/**
 * Page-level error state per 06 A.11: icon + plain-language reason + Retry +
 * a route out. Institutional tone — a reason and a recovery, never a bare
 * "Error:". Used by the route-group error boundaries (FLOW-04).
 * The route out is a plain <a> so it works even if client routing is the
 * thing that failed. The quiet wheat-sheaf line art (PART I.2 family) softens
 * the page-level surface; the A.11 alert-triangle stays inline with the title
 * so the semantic cue is never lost.
 */
export function ErrorState({
  title,
  detail,
  reset,
  homeHref,
  homeLabel,
  digest,
}: {
  title: string;
  detail: string;
  reset: () => void;
  homeHref: string;
  homeLabel: string;
  digest?: string;
}) {
  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-5 py-16 text-center"
    >
      <WheatSheafIllustration size={72} />
      <p className="mt-4 flex items-center justify-center gap-2 font-display text-xl font-semibold text-fg">
        <AlertTriangle className="size-5 shrink-0 text-[var(--color-warning)]" aria-hidden />
        {title}
      </p>
      <p className="mt-2 text-sm text-muted">{detail}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset}>Try again</Button>
        <a href={homeHref} className={buttonVariants({ variant: "secondary" })}>
          {homeLabel}
        </a>
      </div>
      {digest && (
        <p className="mt-4 font-mono text-[11px] text-muted">Reference: {digest}</p>
      )}
    </div>
  );
}
