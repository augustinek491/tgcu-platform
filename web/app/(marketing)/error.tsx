"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Error boundary for the public marketing pages (FLOW-04, 06 A.11). Renders
 * inside the marketing chrome, so the header navigation stays available.
 */
export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title={"This page didn't load"}
      detail="A problem interrupted this page. Try again, or return to the home page."
      reset={reset}
      homeHref="/"
      homeLabel="Back to home"
      digest={error.digest}
    />
  );
}
