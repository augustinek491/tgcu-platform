/**
 * TGCU Platform — Cloud Functions (design/03 §4).
 * North-star: every governed write (money / member / price / role / audit / deals /
 * escrow) runs here via the Admin SDK inside a transaction, with an audit entry written
 * in the SAME transaction. Clients never write governed data directly (Rules deny it).
 * Live payment/tracking processing is [DEMO-STUB ok] (sandbox/manual adapters).
 */
import { onCall, onRequest, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

type Role = "super_admin" | "secretariat_staff" | "data_officer" | "field_officer" | "org_admin" | "member";

// ── Auth helpers ────────────────────────────────────────────────────────────
function requireAuth<T>(req: CallableRequest<T>): { uid: string; role: Role; orgId?: string } {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in required.");
  const token = req.auth.token as { role?: Role; orgId?: string };
  return { uid: req.auth.uid, role: token.role ?? "member", orgId: token.orgId };
}
function requireRole<T>(req: CallableRequest<T>, roles: Role[]) {
  const ctx = requireAuth(req);
  if (!roles.includes(ctx.role)) {
    throw new HttpsError("permission-denied", `Requires one of: ${roles.join(", ")}.`);
  }
  return ctx;
}

/** Append an immutable audit entry inside the caller's transaction (H3/FR-ADM-13). */
function writeAudit(
  tx: FirebaseFirestore.Transaction,
  entry: {
    actorUid: string;
    actorRole: string;
    action: string;
    entityType: string;
    entityId: string;
    before?: unknown;
    after?: unknown;
  },
) {
  const ref = db.collection("auditLogs").doc();
  tx.set(ref, {
    ...entry,
    serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    channel: "web",
    requestId: ref.id,
  });
}

// ── RBAC: mint role claims (Super-Admin only) ───────────────────────────────
export const setUserRole = onCall(async (req: CallableRequest<{ targetUid: string; role: Role; orgId?: string }>) => {
  const actor = requireRole(req, ["super_admin"]);
  const { targetUid, role, orgId } = req.data;
  await admin.auth().setCustomUserClaims(targetUid, { role, orgId: orgId ?? null });
  await admin.auth().revokeRefreshTokens(targetUid); // downgrade takes effect within seconds (H4)
  await db.runTransaction(async (tx) => {
    tx.set(db.collection("roleAssignments").doc(targetUid), { role, orgId: orgId ?? null, assignedBy: actor.uid });
    writeAudit(tx, { actorUid: actor.uid, actorRole: actor.role, action: "ROLE_ASSIGN", entityType: "user", entityId: targetUid, after: { role, orgId } });
  });
  return { ok: true };
});

// ── Manual / offline payment (FR-MEM-28) — always-available, [LIVE] ─────────
export const recordManualPayment = onCall(
  async (req: CallableRequest<{ invoiceId: string; amountUGX: number; method: string; externalReference?: string }>) => {
    const actor = requireRole(req, ["super_admin", "secretariat_staff"]);
    const { invoiceId, amountUGX, method, externalReference } = req.data;
    if (!(amountUGX > 0)) throw new HttpsError("invalid-argument", "amountUGX must be positive.");

    return db.runTransaction(async (tx) => {
      const invRef = db.collection("invoices").doc(invoiceId);
      const inv = await tx.get(invRef);
      if (!inv.exists) throw new HttpsError("not-found", "Invoice not found.");
      const data = inv.data()!;
      const paid = (data.paidUGX ?? 0) + amountUGX;
      const status = paid >= data.amountDueUGX ? "paid" : "part-paid";

      const payRef = db.collection("payments").doc();
      tx.set(payRef, {
        orgId: data.orgId, invoiceId, amountUGX, direction: "collection",
        provider: "manual", instrument: method, status: "success",
        externalReference: externalReference ?? null, recordedByUid: actor.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      tx.update(invRef, { paidUGX: paid, status });
      // Recompute org standing atomically (good once dues clear).
      if (status === "paid") tx.update(db.collection("organisations").doc(data.orgId), { standing: "good" });
      writeAudit(tx, { actorUid: actor.uid, actorRole: actor.role, action: "PAYMENT_MANUAL", entityType: "invoice", entityId: invoiceId, after: { amountUGX, method, status } });
      return { ok: true, status };
    });
  },
);

// ── Provider webhook: idempotent escrow/dues callback (DR-05, H1) ───────────
export const paymentCallback = onRequest(async (req, res) => {
  // In production: verify the provider's signature here before trusting the payload.
  const { provider, providerTxnRef, orgId, invoiceId, amountUGX, dealId, purpose } = req.body ?? {};
  if (!provider || !providerTxnRef) {
    res.status(400).json({ error: "missing provider/providerTxnRef" });
    return;
  }
  const payId = `${provider}__${providerTxnRef}`; // deterministic doc-id = idempotency key
  await db.runTransaction(async (tx) => {
    const ref = db.collection("payments").doc(payId);
    const existing = await tx.get(ref);
    if (existing.exists) return; // duplicate/late callback → no-op (idempotent)
    tx.set(ref, {
      provider, providerTxnRef, orgId: orgId ?? null, invoiceId: invoiceId ?? null,
      dealId: dealId ?? null, purpose: purpose ?? "dues", amountUGX: amountUGX ?? 0,
      direction: "collection", status: "success",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    writeAudit(tx, { actorUid: "system", actorRole: "System", action: "PAYMENT_CALLBACK", entityType: "payment", entityId: payId, after: { provider, amountUGX, purpose } });
  });
  res.json({ ok: true });
});

// ── Field-data verification (FR-ADM-05/07) ──────────────────────────────────
export const submitFieldObservation = onCall(
  async (req: CallableRequest<{ commodityId: string; marketId: string; priceUGX: number; observationDate: string }>) => {
    const actor = requireRole(req, ["field_officer"]);
    const { commodityId, marketId, priceUGX, observationDate } = req.data;
    if (!commodityId || !marketId || !(priceUGX > 0) || !observationDate) {
      throw new HttpsError("invalid-argument", "commodity, market, price>0 and observationDate are required.");
    }
    const ref = db.collection("fieldSubmissions").doc();
    // Provenance set SERVER-SIDE — client cannot forge identity/time (H6/FR-ADM-06).
    await ref.set({
      submittedByUid: actor.uid, commodityId, marketId, priceUGX, observationDate,
      serverCapturedAt: admin.firestore.FieldValue.serverTimestamp(),
      state: "SUBMITTED", screeningFlags: [],
    });
    return { ok: true, id: ref.id };
  },
);

export const decideSubmission = onCall(
  async (req: CallableRequest<{ submissionId: string; decision: "APPROVED" | "REJECTED" | "RETURNED"; reason?: string }>) => {
    const actor = requireRole(req, ["data_officer", "secretariat_staff", "super_admin"]);
    const { submissionId, decision, reason } = req.data;
    if (decision !== "APPROVED" && !reason) {
      throw new HttpsError("invalid-argument", "A reason is mandatory for reject/return.");
    }
    return db.runTransaction(async (tx) => {
      const subRef = db.collection("fieldSubmissions").doc(submissionId);
      const sub = await tx.get(subRef);
      if (!sub.exists) throw new HttpsError("not-found", "Submission not found.");
      const s = sub.data()!;
      // Separation of duties: submitter can never approve their own record (FR-ADM-12).
      if (s.submittedByUid === actor.uid) throw new HttpsError("permission-denied", "Submitter cannot review own submission.");

      tx.update(subRef, { state: decision, reviewedByUid: actor.uid, reviewNote: reason ?? null });
      if (decision === "APPROVED") {
        // Publish → create the trusted price record (roll-up materializes via trigger).
        const recId = `${s.marketId}__${s.commodityId}__${s.observationDate}`;
        tx.set(db.collection("priceRecords").doc(recId), {
          marketId: s.marketId, commodityId: s.commodityId, priceUGX: s.priceUGX,
          observationDate: s.observationDate, source: "enumerator", confidence: "medium",
          ingestedBy: actor.uid, ingestedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      writeAudit(tx, { actorUid: actor.uid, actorRole: actor.role, action: decision, entityType: "fieldSubmission", entityId: submissionId, after: { decision, reason: reason ?? null } });
      return { ok: true };
    });
  },
);

// ── Marketplace: accept an offer with a transactional listing-lock (FR-MKTPL-21) ──
export const acceptOffer = onCall(async (req: CallableRequest<{ offerId: string }>) => {
  const actor = requireAuth(req);
  const { offerId } = req.data;
  return db.runTransaction(async (tx) => {
    const offerRef = db.collection("offers").doc(offerId);
    const offer = await tx.get(offerRef);
    if (!offer.exists) throw new HttpsError("not-found", "Offer not found.");
    const o = offer.data()!;
    const listingRef = db.collection("listings").doc(o.listingId);
    const listing = await tx.get(listingRef);
    // Concurrent-accept guard: only proceed if the listing is still active/unlocked.
    if (!listing.exists || listing.data()!.status !== "active") {
      throw new HttpsError("failed-precondition", "Listing no longer available.");
    }
    // Lock listing, auto-reject all other pending offers, create the deal.
    tx.update(listingRef, { status: "deal-locked" });
    tx.update(offerRef, { status: "accepted" });
    const others = await db.collection("offers").where("listingId", "==", o.listingId).where("status", "==", "pending").get();
    for (const d of others.docs) if (d.id !== offerId) tx.update(d.ref, { status: "rejected" });

    const dealRef = db.collection("deals").doc();
    tx.set(dealRef, {
      listingId: o.listingId, sellerOrgId: listing.data()!.ownerOrgId, buyerOrgId: o.offerorOrgId,
      commodity: listing.data()!.commodity, agreedQuantityKg: o.offeredQuantityKg,
      agreedPriceUGXPerKg: o.offeredPriceUGXPerKg, state: "agreed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    writeAudit(tx, { actorUid: actor.uid, actorRole: actor.role, action: "OFFER_ACCEPTED", entityType: "deal", entityId: dealRef.id, after: { offerId, listingId: o.listingId } });
    return { ok: true, dealId: dealRef.id };
  });
});

// ── Deal state machine transition (server-owned, audited) (FR-MKTPL-31) ─────
const DEAL_TRANSITIONS: Record<string, string[]> = {
  agreed: ["funded", "cancelled"],
  funded: ["in_transit", "disputed"],
  in_transit: ["delivered", "disputed"],
  delivered: ["completed", "disputed"],
  disputed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const transitionDeal = onCall(async (req: CallableRequest<{ dealId: string; to: string }>) => {
  const actor = requireAuth(req);
  const { dealId, to } = req.data;
  return db.runTransaction(async (tx) => {
    const ref = db.collection("deals").doc(dealId);
    const deal = await tx.get(ref);
    if (!deal.exists) throw new HttpsError("not-found", "Deal not found.");
    const from = deal.data()!.state as string;
    if (!(DEAL_TRANSITIONS[from] ?? []).includes(to)) {
      writeAudit(tx, { actorUid: actor.uid, actorRole: actor.role, action: "DEAL_TRANSITION_DENIED", entityType: "deal", entityId: dealId, before: { from }, after: { to } });
      throw new HttpsError("failed-precondition", `Illegal transition ${from} → ${to}.`);
    }
    tx.update(ref, { state: to, stateChangedAt: admin.firestore.FieldValue.serverTimestamp(), stateChangedBy: actor.uid });
    // Escrow side-effects (append-only ledger; FR-MKTPL-40/42).
    if (to === "completed") tx.set(db.collection("escrow").doc(), { dealId, event: "released", at: admin.firestore.FieldValue.serverTimestamp() });
    if (to === "cancelled") tx.set(db.collection("escrow").doc(), { dealId, event: "refunded", at: admin.firestore.FieldValue.serverTimestamp() });
    writeAudit(tx, { actorUid: actor.uid, actorRole: actor.role, action: "DEAL_TRANSITION", entityType: "deal", entityId: dealId, before: { from }, after: { to } });
    return { ok: true };
  });
});

// ── Roll-up materialization on price write (H2/H5, DR-07) ────────────────────
export const onPriceRecordWrite = onDocumentWritten("priceRecords/{id}", async (event) => {
  const after = event.data?.after?.data();
  if (!after) return;
  const { marketId, commodityId, observationDate, priceUGX, source, confidence } = after as {
    marketId: string; commodityId: string; observationDate: string; priceUGX: number; source: string; confidence: string;
  };
  const month = String(observationDate).slice(0, 7); // YYYY-MM
  // Recompute the month roll-up from raw (idempotent under at-least-once delivery).
  const raw = await db
    .collection("priceRecords")
    .where("marketId", "==", marketId)
    .where("commodityId", "==", commodityId)
    .get();
  const monthPoints = raw.docs
    .map((d) => d.data())
    .filter((r) => String(r.observationDate).slice(0, 7) === month)
    .map((r) => ({ date: r.observationDate, priceUGX: r.priceUGX, source: r.source, confidence: r.confidence }));
  const prices = monthPoints.map((p) => p.priceUGX);
  await db.collection("priceSeriesMonthly").doc(`${marketId}__${commodityId}__${month}`).set({
    marketId, commodityId, month, points: monthPoints,
    min: Math.min(...prices), max: Math.max(...prices),
    avg: Math.round(prices.reduce((s, v) => s + v, 0) / prices.length),
    count: prices.length, lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  });
  await db.collection("priceSeriesLatest").doc(`${marketId}__${commodityId}`).set(
    { marketId, commodityId, latest: { priceUGX, observationDate, source, confidence }, asOf: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true },
  );
});
