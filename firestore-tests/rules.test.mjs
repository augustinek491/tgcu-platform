/**
 * TGCU Firestore Security Rules — emulator test suite (design/03 §5 named deliverable).
 * Verifies the security posture that makes the platform trustworthy: deny-by-default,
 * org isolation, immutability of the audit log, server-write-only governed collections,
 * and public-reference readability. Run: npm test (spins up the firestore emulator).
 */
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "node:fs";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import assert from "node:assert";

const testEnv = await initializeTestEnvironment({
  projectId: "demo-tgcu",
  firestore: { rules: readFileSync("../firestore.rules", "utf8") },
});

// Contexts
const anon = testEnv.unauthenticatedContext().firestore();
const memberA = testEnv.authenticatedContext("uA", { role: "member", orgId: "orgA" }).firestore();
const memberB = testEnv.authenticatedContext("uB", { role: "member", orgId: "orgB" }).firestore();
const staff = testEnv.authenticatedContext("uS", { role: "secretariat_staff" }).firestore();
const superAdmin = testEnv.authenticatedContext("uSA", { role: "super_admin" }).firestore();

// Seed with rules disabled
await testEnv.withSecurityRulesDisabled(async (ctx) => {
  const d = ctx.firestore();
  await setDoc(doc(d, "organisations/orgA"), { legalName: "Org A", orgId: "orgA" });
  await setDoc(doc(d, "invoices/inv1"), { orgId: "orgA", amountDueUGX: 1000 });
  await setDoc(doc(d, "auditLogs/al1"), { action: "SEED", entityId: "x" });
  await setDoc(doc(d, "markets/kampala"), { name: "Kampala" });
  await setDoc(doc(d, "deals/deal1"), { buyerOrgId: "orgA", sellerOrgId: "orgC", state: "funded" });
});

let passed = 0;
async function check(name, promise) {
  await promise;
  passed++;
  console.log(`  ✓ ${name}`);
}

console.log("TGCU Firestore rules:");

// 1. Deny-by-default: anonymous can't read PII
await check("anon cannot read an organisation", assertFails(getDoc(doc(anon, "organisations/orgA"))));

// 2. Org isolation
await check("member A reads own org", assertSucceeds(getDoc(doc(memberA, "organisations/orgA"))));
await check("member B CANNOT read org A", assertFails(getDoc(doc(memberB, "organisations/orgA"))));
await check("member A reads own org invoice", assertSucceeds(getDoc(doc(memberA, "invoices/inv1"))));
await check("member B CANNOT read org A invoice", assertFails(getDoc(doc(memberB, "invoices/inv1"))));
await check("staff reads any org", assertSucceeds(getDoc(doc(staff, "organisations/orgA"))));

// 3. Audit log immutability + server-only
await check("super-admin can READ audit log", assertSucceeds(getDoc(doc(superAdmin, "auditLogs/al1"))));
await check("nobody can CREATE audit entries from client", assertFails(setDoc(doc(superAdmin, "auditLogs/al2"), { a: 1 })));
await check("nobody can UPDATE an audit entry (immutable)", assertFails(updateDoc(doc(superAdmin, "auditLogs/al1"), { action: "TAMPER" })));

// 4. Governed collections are server-write-only
await check("member cannot write organisations", assertFails(setDoc(doc(memberA, "organisations/orgA"), { legalName: "hacked" })));
await check("member cannot write payments", assertFails(setDoc(doc(memberA, "payments/p1"), { amountUGX: 1 })));
await check("field officer path: client cannot write priceRecords", assertFails(setDoc(doc(memberA, "priceRecords/x"), { priceUGX: 1 })));
await check("client cannot write deal.state directly", assertFails(setDoc(doc(memberA, "deals/deal1"), { state: "completed" })));

// 5. Deal read scoping
await check("buyer org reads its deal", assertSucceeds(getDoc(doc(memberA, "deals/deal1"))));
await check("unrelated member CANNOT read the deal", assertFails(getDoc(doc(memberB, "deals/deal1"))));

// 6. Public reference data
await check("signed-in member reads public market ref", assertSucceeds(getDoc(doc(memberA, "markets/kampala"))));
await check("anon CANNOT read market ref (App-Check/auth gate)", assertFails(getDoc(doc(anon, "markets/kampala"))));

await testEnv.cleanup();
assert(passed === 17, `expected 17 checks, got ${passed}`);
console.log(`\n${passed}/17 rules checks passed ✓`);
