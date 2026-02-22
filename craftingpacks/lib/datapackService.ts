import { db } from "./firebase";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import type { DatapackSpec } from "./datapackPrompt";

export async function saveDatapack(datapack: DatapackSpec, uid: string | null) {
  const docRef = await addDoc(collection(db, "datapacks"), {
    ...datapack,
    uid,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function readDatapack(id: string) {
  const snap = await getDoc(doc(db, "datapacks", id));
  return snap.exists() ? (snap.data() as DatapackSpec) : null;
}