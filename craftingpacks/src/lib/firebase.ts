import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const projectId =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: projectId ? `${projectId}.firebaseapp.com` : undefined,
  projectId,
  storageBucket: projectId ? `${projectId}.appspot.com` : undefined,
  messagingSenderId: "521213884863", // Firebase Messaging Sender ID
  appId: "1:521213884863:web:1f039c56d23d1d75b2890a", // Firebase App ID
  measurementId: "G-DSX9XXCZQ6", // Optional: Firebase Measurement ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
