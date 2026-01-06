import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// You should set these environment variables in your .env.local
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = !getApps().length
    ? initializeApp({
        credential: cert(serviceAccount),
    })
    : getApp();

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { adminAuth, adminDb };
