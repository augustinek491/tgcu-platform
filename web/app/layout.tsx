import type { Metadata, Viewport } from "next";
import { Newsreader, Public_Sans } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

// Self-hosted via next/font (no render-blocking Google request, swap) — design/02 §5.4.
// Canonical weights per DS §9.2/AM-09: Newsreader 500/600 · Public Sans 400/500/600.
// Only `latin` is preloaded (PERF-01: ≤120KB budget); latin-ext stays declared with
// unicode-range so Luganda diacritics fetch on demand the day they render (FR-MEM-92
// readiness preserved). IBM Plex Mono is admin-scoped — see app/(app)/admin/layout.tsx.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-newsreader",
  display: "swap",
});
const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Grain Council of Uganda",
    template: "%s · TGCU",
  },
  description:
    "Membership, market data, and grain marketplace for The Grain Council of Uganda — making Uganda the region's grain basket.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#166534" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${newsreader.variable} ${publicSans.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
