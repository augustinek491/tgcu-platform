# The Grain Council of Uganda — Platform

A digital platform for **The Grain Council of Uganda (TGCU)** — a national grain-industry
membership body in Kampala. Four modules on one identity spine: **Membership**, **Market
Data & Analytics**, an asset-light **Marketplace**, and **Admin & Data-Governance**.

**Live demo:** https://tgcu-platform.web.app

> **Status: v1 demo.** Runs on seeded, clearly-labelled synthetic data with a login-bypass
> so it's fully navigable. No real funds move (marketplace escrow is sandbox) and no real PII
> is stored. Live auth, live data, and the production compliance gates are deliberate later steps.

## What's inside
| Module | Highlights |
|---|---|
| **Membership** | History-depth tiers (Bronze→Platinum), member portal, dues + defaulter/arrears management, provider-agnostic payment seam, verified-member badge |
| **Market Data** | Monthly wholesale prices with provenance on every point, interactive Recharts trends (gap-honest), market comparison, movers (MoM-labelled), a national commodities map, tier-gated history depth |
| **Marketplace** | Verified-member listings, offers, a server-owned deal state machine, escrow ledger (`held = funded − released − refunded`), a vendor-agnostic goods-in-transit tracking seam, ratings |
| **Admin** | Field-data verification queue (provenance + screening + human decision, fail-closed), append-only audit log, canonical six-role RBAC |

Design principle throughout: **honest data** — monthly data is never labelled "live", grades
are "self-declared, not lab-certified", and demo money is labelled sandbox.

## Stack
- **Web:** Next.js 15 (App Router, RSC-first) · React 19 · TypeScript (strict) · Tailwind v4 · Recharts
- **Backend:** Firebase — Firestore, Cloud Functions (server-owned writes), Auth, Hosting
- Real TGCU brand: kelly green + grain gold, sun/grain-arc + wheat-sheaf mark.

## Repository layout
```
web/               Next.js application (the UI)
functions/         Cloud Functions — server-owned writes (money/member/price/role/audit/deals)
firestore.rules    Security Rules — deny-by-default, org isolation, audit immutability
firestore.indexes.json
firestore-tests/   Emulator rules-test suite (17 checks)
firebase.json      Firebase config (Firestore + Functions + Hosting + emulators)
BACKEND.md         Backend architecture & deploy notes
```

## Run locally
```bash
# Web app (demo mode — no Firebase needed)
cd web && npm install && npm run dev            # http://localhost:3000

# Firestore rules tests (needs Java 11+ for firebase-tools@13)
cd firestore-tests && npm install && npm test   # 17/17 checks

# Cloud Functions (compile)
cd functions && npm install && npm run build
```

## Deploy
```bash
firebase deploy    # rules, indexes, functions, and the Next.js app (hosting)
```
See [BACKEND.md](BACKEND.md) for the full deploy path and the open production gates
(data residency / Uganda DPA, and escrow fund-custody) that must be cleared before any
real PII or money.

---
Built with a multi-agent, rubric-gated, spec-first methodology. Not financial advice.
