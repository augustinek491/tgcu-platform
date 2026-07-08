/**
 * Seed the Firestore emulator with a minimal, representative TGCU dataset so the
 * backend can be exercised locally (design/03 deliverable). Run against the emulator:
 *   firebase emulators:exec --only firestore "node lib/seed.js"
 * Guards against writing to a real project (requires FIRESTORE_EMULATOR_HOST).
 */
import * as admin from "firebase-admin";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("Refusing to seed: FIRESTORE_EMULATOR_HOST is not set (emulator only).");
}

admin.initializeApp({ projectId: "demo-tgcu" });
const db = admin.firestore();

async function seed() {
  const batch = db.batch();

  // Tiers (FR-MEM-11.1)
  const tiers = [
    { id: "bronze", name: "Bronze", sortOrder: 1, entitlements: ["market_data.current_prices", "marketplace.browse"] },
    { id: "silver", name: "Silver", sortOrder: 2, entitlements: ["market_data.trends_dashboard", "directory.full_contact_visibility"] },
    { id: "gold", name: "Gold", sortOrder: 3, entitlements: ["market_data.full_history_export"] },
    { id: "platinum", name: "Platinum", sortOrder: 4, entitlements: ["market_data.full_database", "logistics.tracking", "support.priority"] },
  ];
  tiers.forEach((t) => batch.set(db.collection("membershipTiers").doc(t.id), t));

  // Organisations
  const orgs = [
    { id: "org_aponye", legalName: "Aponye (U) Ltd", category: "processor", region: "Central", tierId: "gold", status: "active", standing: "good", outstandingBalance: 0, isPII: true },
    { id: "org_gulu", legalName: "Gulu Grain Traders Assoc.", category: "trader", region: "Northern", tierId: "bronze", status: "suspended", standing: "suspended", outstandingBalance: 300000, isPII: true },
  ];
  orgs.forEach((o) => batch.set(db.collection("organisations").doc(o.id), o));

  // Markets + commodities
  ["kampala", "mbarara", "gulu"].forEach((m) =>
    batch.set(db.collection("markets").doc(m), { name: m[0].toUpperCase() + m.slice(1), active: true }),
  );
  ["maize", "beans", "rice"].forEach((c) =>
    batch.set(db.collection("commodities").doc(c), { name: c[0].toUpperCase() + c.slice(1), unit: "UGX/kg", isGrain: true }),
  );

  // A trusted price record + its latest roll-up
  const recId = "kampala__maize__2026-06";
  batch.set(db.collection("priceRecords").doc(recId), {
    marketId: "kampala", commodityId: "maize", priceUGX: 1880, observationDate: "2026-06-01",
    source: "tgcu-excel", confidence: "high", ingestedBy: "system",
  });
  batch.set(db.collection("priceSeriesLatest").doc("kampala__maize"), {
    marketId: "kampala", commodityId: "maize",
    latest: { priceUGX: 1880, observationDate: "2026-06-01", source: "tgcu-excel", confidence: "high" },
  });

  // A verified listing
  batch.set(db.collection("listings").doc("lst_seed"), {
    type: "sell", commodity: "Maize", quantityKg: 40000, grade: "EAS2-Grade1",
    priceUGXPerKg: 1780, ownerOrgId: "org_aponye", status: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
  const counts = {
    tiers: tiers.length,
    organisations: orgs.length,
    markets: 3,
    commodities: 3,
    priceRecords: 1,
    listings: 1,
  };
  console.log("Seeded emulator:", JSON.stringify(counts));
}

seed().then(() => process.exit(0));
