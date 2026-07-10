"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary (FLOW-04): replaces the root layout when it fails, so
 * it must render its own <html>/<body> and cannot rely on globals.css or
 * next/font. Styling is inline with the light-theme token values; copy follows
 * 06 A.11 (reason + retry + route out, institutional tone).
 */
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fafaf9",
          color: "#1c1917",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
            {"The platform didn't load"}
          </p>
          <p style={{ fontSize: 14, color: "#57534e", maxWidth: 420, margin: "8px auto 0" }}>
            An unexpected problem interrupted the whole page. Try again — if it repeats, the
            home page is the safest route back.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                height: 44,
                padding: "0 20px",
                borderRadius: 8,
                border: 0,
                background: "#166534",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                height: 44,
                padding: "0 20px",
                borderRadius: 8,
                border: "1px solid #e7e5e4",
                display: "inline-flex",
                alignItems: "center",
                background: "#ffffff",
                color: "#1c1917",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>
          {error.digest && (
            <p style={{ marginTop: 16, fontSize: 12, color: "#57534e"}}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
