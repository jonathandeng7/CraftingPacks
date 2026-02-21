import { db } from "./firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import type { DatapackSpec } from "./datapackPrompt";

export async function saveDatapack(datapack: DatapackSpec) {
  const docRef = await addDoc(collection(db, "datapacks"), datapack);
  return docRef.id;
}

export async function readDatapack(id: string) {
  const snap = await getDoc(doc(db, "datapacks", id));
  return snap.exists() ? (snap.data() as DatapackSpec) : null;
}