"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

/**
 * Error boundary for the authenticated area (FLOW-04, 06 A.11). Renders inside
 * the app shell, so the sidebar/topbar escape routes stay available.
 */
export default function AppError({
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
      detail="A problem interrupted this view. The rest of the platform is unaffected — try again, or return to the dashboard."
      reset={reset}
      homeHref="/dashboard"
      homeLabel="Go to dashboard"
      digest={error.digest}
    />
  );
}
