"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Login form island. In v1-demo mode this continues straight to the dashboard;
 * production swaps in Firebase Auth (Web SDK) → POST /api/session to mint the
 * httpOnly session cookie (design/02 §2.4). The Auth SDK chunk stays lazy.
 */
export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function continueDemo(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    router.push("/dashboard");
  }

  return (
    <form onSubmit={continueDemo} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-fg">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          defaultValue="secretariat@tgcu.org"
          className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface px-3 text-base focus-visible:border-ring"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-fg">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          defaultValue="demo-password"
          className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-surface px-3 text-base focus-visible:border-ring"
        />
      </div>
      {/* PART C: primary full-width h44 — md size, not lg/48 (LAY-09) */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Continue to demo"}
        {!loading && <ArrowRight className="size-4" />}
      </Button>
      <p className="text-center text-xs text-muted">
        Demo mode — no live authentication. Any credentials continue to the dashboard.
      </p>
    </form>
  );
}
