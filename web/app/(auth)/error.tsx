"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

/** Error boundary for the auth screens (FLOW-04, 06 A.11). */
export default function AuthError({
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
      title={"Sign-in didn't load"}
      detail="A problem interrupted the sign-in screen. Try again, or return to the home page."
      reset={reset}
      homeHref="/"
      homeLabel="Back to home"
      digest={error.digest}
    />
  );
}
