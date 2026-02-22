import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";

// SIGN UP
export async function signUp(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// LOGIN
export async function logIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// LOGOUT
export async function logOut() {
  await signOut(auth);
}

// LISTEN FOR LOGIN STATE
export function observeAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}