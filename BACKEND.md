# TGCU Platform — Firebase Backend (backend-as-code)

Realizes [`platform-plan/design/03-backend-architecture.md`](platform-plan/design/03-backend-architecture.md).
The `web/` Next.js app currently runs in **demo mode** on seeded data; this backend is the
deployable, tested Firestore/Functions layer it swaps onto for live data.

## Layout
```
firebase.json            Firestore + Functions + Hosting(web) + emulator config
.firebaserc              project alias (demo-tgcu)
firestore.rules          Security Rules — the enforcement wall (design §5)
firestore.indexes.json   composite indexes (design §3.3)
functions/               Cloud Functions (TypeScript, Node 20) — server-owned writes (design §4)
  src/index.ts           setUserRole, recordManualPayment, paymentCallback,
                         submitFieldObservation, decideSubmission, acceptOffer,
                         transitionDeal, onPriceRecordWrite (roll-up)
  src/seed.ts            emulator seed script
firestore-tests/         emulator rules-test suite (design §5 named deliverable)
  rules.test.mjs         17 checks — deny-by-default, org isolation, audit immutability, …
```

## North-star (why this is trustworthy on Firestore)
All governed writes (money / member / price / role / audit / deals / escrow) run **only**
through Cloud Functions via the Admin SDK, with an **audit entry written in the same
transaction**. Client SDK access is **reads + Auth only**; Security Rules deny every
governed client write. Rules are the second, independent wall: deny-by-default + org
scoping (`request.auth.token.orgId`) + immutability (`update, delete: if false` on
`auditLogs`, escrow, corrections, consents). RBAC is Auth **custom claims** (six roles,
FR-ADM-12); fine gating reads the fresh `entitlements/{uid}` doc (beats claim staleness).

## Verified locally (evidence)
- **Rules test suite: 17/17 pass** against the Firestore emulator
  (`cd firestore-tests && npm test`) — confirms deny-by-default, org A↔B isolation,
  audit-log create/update denied to all clients, payments/priceRecords/deals server-only,
  deal read-scoping, public-reference readability.
- **Functions compile clean** (`cd functions && npm run build`).
- **Seed runs** against the emulator (tiers/orgs/markets/commodities/priceRecords/listings).

> **Emulator note:** firebase-tools ≥14 needs **Java 21**; this machine has Java 11, so the
> suite runs via `npx firebase-tools@13.29.1 emulators:exec` (pinned in the test script).
> Install JDK 21 to use the globally-installed CLI.

## Deploy (production — gated)
`firebase login` then `firebase deploy` (rules, indexes, functions, hosting). **Before the
first real-PII write**, clear the production gates: **data residency / Uganda DPA** (Firestore
region is immutable and there is no Africa region — SCOPE §5.3) and **escrow fund custody**
(licensed PSP / segregated account under the NPS Act — RISK-MKTPL-08). The demo holds no real
funds and stores only synthetic data.
```bash
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only functions
firebase deploy --only hosting        # Next.js via frameworks backend
```
