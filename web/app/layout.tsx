import type { Metadata, Viewport } from "next";
import { Newsreader, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

// Self-hosted via next/font (no render-blocking Google request, swap, Latin-Extended
// subset covers Luganda diacritics) — design/02 §5.4.
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
  display: "swap",
});
const publicSans = Public_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-public-sans",
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
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
      className={`${newsreader.variable} ${publicSans.variable} ${ibmPlexMono.variable}`}
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
