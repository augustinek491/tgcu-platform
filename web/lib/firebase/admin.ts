import "server-only";
/**
 * Firebase Admin SDK — server only. Used for privileged reads (first paint / SEO),
 * session-cookie verification, and all money/member/price/role writes (design/02 §D-3,
 * §2.4). `server-only` guarantees this never leaks into a client bundle.
 */
import { getApps, initializeApp, cert, getApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export const isAdminConfigured = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY,
);

let adminApp: App | undefined;

function getAdminApp(): App {
  if (!isAdminConfigured) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_* env vars, or run in demo mode.",
    );
  }
  if (getApps().length) return getApp();
  adminApp ??= initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Vercel/dotenv store the key with escaped newlines — restore them.
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
  return adminApp;
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}
