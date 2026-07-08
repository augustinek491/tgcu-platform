# TGCU Platform — web (v1 demo)

Next.js 15 (App Router, RSC-first) + Firebase implementation of the TGCU platform.
Built to the locked plan in [`../platform-plan/`](../platform-plan/) — requirements,
design system, and architecture. This folder is the application; the planning artifacts
and research knowledge base live one level up.

## Stack
- **Next.js 15** App Router, React 19, TypeScript (strict)
- **Tailwind CSS v4** with semantic CSS-variable tokens (light + dark)
- **Firebase** — Web SDK (client, lazy) + Admin SDK (server-only) seams
- **TanStack Query** server-state cache · **next-themes** · **lucide-react** icons
- Fonts self-hosted via `next/font`: Newsreader (display) · Public Sans (UI) · IBM Plex Mono (data)

## Getting started
```bash
npm install
cp .env.example .env.local   # optional — the demo runs without Firebase
npm run dev                  # http://localhost:3000
```
The app runs in **demo mode** (`NEXT_PUBLIC_DEMO_MODE=true`) with seeded, clearly-labelled
data and no live authentication or payment gateway. Set the `FIREBASE_*` / `NEXT_PUBLIC_FIREBASE_*`
vars and flip demo mode off to wire real services.

## Structure (design/02 §1.2)
```
app/
  (marketing)/   public landing + pricing — RSC, no Firebase SDK
  (auth)/        login/register/reset — centered card shell
  (app)/         member area — AppShell (sidebar + topbar), dashboard + module routes
components/      brand (logo), ui (primitives), shell, charts, states
lib/             firebase (client/admin), providers, utils, demo data
middleware.ts    edge cookie gate (bypassed in demo mode)
```

## What's built (this slice — PH-1 foundation)
- Real TGCU brand tokens + logo (sun/grain arc + wheat sheaf), light/dark
- App shell, marketing landing, auth login, dashboard with KPIs + price-trend + movers
- Firebase client/admin seams, providers, base component library
- Module routes (Market, Membership, Marketplace, Admin) scaffolded with honest
  "planned this slice" states — no fake data

## Production gates (deferred, not decided here)
- **Data residency / Uganda DPA** — Firebase has no Africa region and region is immutable
  after creation; decide before first real-PII write (SCOPE §5.3).
- **Escrow fund custody** — holding buyer funds needs a licensed-PSP / segregated-account
  legal basis (BoU/NPS Act) before real money moves.
