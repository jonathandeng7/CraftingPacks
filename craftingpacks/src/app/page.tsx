"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@lib/firebase";

import coalIcon from "./icons/coal.webp";
import cookedIcon from "./icons/cookedPC.webp";
import uncookedIcon from "./icons/uncookedpC.png";

const DEFAULT_VERSION = "1.20.1";
const FURNACE_IMG_URL =
  "data:image/png;base64,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";

function firebaseErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  // Firebase errors come like "Firebase: Error (auth/invalid-credential)."
  if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password")) {
    return "Wrong email or password.";
  }
  if (msg.includes("auth/user-not-found")) {
    return "No account found with that email.";
  }
  if (msg.includes("auth/email-already-in-use")) {
    return "That email is already in use.";
  }
  if (msg.includes("auth/weak-password")) {
    return "Password is too weak (try 6+ characters).";
  }
  if (msg.includes("auth/invalid-email")) {
    return "Email is invalid.";
  }
  return msg;
}

function maskEmail(email?: string | null) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const shown = name.length <= 2 ? name : `${name.slice(0, 2)}…`;
  return `${shown}@${domain}`;
}

export default function Home() {
  // ====== AUTH STATE ======
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  async function onAuthSubmit() {
    setAuthError(null);
    setAuthBusy(true);
    try {
      const e = email.trim();
      if (!e || !password) {
        throw new Error("Enter email + password.");
      }

      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, e, password);
      } else {
        await createUserWithEmailAndPassword(auth, e, password);
      }

      setPassword("");
    } catch (err) {
      setAuthError(firebaseErrorMessage(err));
    } finally {
      setAuthBusy(false);
    }
  }

  async function onLogout() {
    setAuthError(null);
    setAuthBusy(true);
    try {
      await signOut(auth);
    } catch (err) {
      setAuthError(firebaseErrorMessage(err));
    } finally {
      setAuthBusy(false);
    }
  }

  // ====== YOUR EXISTING STATE ======
  const [idea, setIdea] = useState("");
  const [version, setVersion] = useState(DEFAULT_VERSION);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [downloadName, setDownloadName] = useState<string>("datapack.zip");
  const [filesPreview, setFilesPreview] = useState<string[]>([]);

  const versions = useMemo(() => ["1.20.1", "1.20.2", "1.20.4", "1.21"], []);

  const canGenerate = idea.trim().length > 0 && !isGenerating;
  const canDownload = Boolean(zipBlob);

  const versions = useMemo(() => [
    // 1.19.x
    "1.19", "1.19.1", "1.19.2", "1.19.3", "1.19.4",
    // 1.20.x
    "1.20", "1.20.1", "1.20.2", "1.20.3", "1.20.4", "1.20.5", "1.20.6",
    // 1.21.x
    "1.21", "1.21.1", "1.21.2", "1.21.3",
  ], []);

  async function onGenerate() {
    setIsGenerating(true);
    setError(null);
    setZipBlob(null);
    setFilesPreview([]);
    setDownloadName("datapack.zip");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // optionally pass user uid so you can save generated packs per-user in Firestore on the server
        body: JSON.stringify({ idea, version, uid: user?.uid ?? null }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const data = (await res.json()) as {
            error?: string;
            message?: string;
            details?: unknown;
          };
          const summary = [data.error, data.message].filter(Boolean).join("\n");
          const details = data.details ? `\n${JSON.stringify(data.details, null, 2)}` : "";
          throw new Error(`${summary || "Request failed."}${details}`);
        }
        throw new Error(`Request failed with status ${res.status}.`);
      }

      if (!contentType.includes("application/zip")) {
        const text = await res.text();
        throw new Error(`Expected a zip response; got: ${contentType}\n${text.slice(0, 500)}`);
      }

      const headerFiles = res.headers.get("x-datapack-files");
      if (headerFiles) {
        try {
          const parsed = JSON.parse(headerFiles);
          if (Array.isArray(parsed) && parsed.every((p) => typeof p === "string")) {
            setFilesPreview(parsed);
          }
        } catch {
          // ignore
        }
      }

      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/i);
      if (match?.[1]) setDownloadName(match[1]);

      const blob = await res.blob();
      setZipBlob(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsGenerating(false);
    }
  }

  function onDownload() {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen px-6 py-12 text-foreground">
      <main className="mx-auto w-full max-w-5xl space-y-6">
        {/* ====== HEADER + AUTH PANEL ====== */}
        <header className="mc-panel rounded-2xl p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl">CraftingPacks Command Forge</h1>
              <p className="mt-2 text-xs text-white/70">
                Feed the furnace with an idea and version. Receive a ready datapack zip.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/popular" className="mc-button mc-button-secondary text-center">
                Popular Packs
              </Link>
              <div className="mc-badge">Minecraft Java</div>

            <div className="mc-panel rounded-2xl p-4 w-full sm:w-[360px]">
              <div className="flex items-center justify-between gap-3">
                <div className="mc-section-title">Account</div>
                {authLoading ? (
                  <span className="mc-badge">Checking…</span>
                ) : user ? (
                  <span className="mc-badge">Signed in</span>
                ) : (
                  <span className="mc-badge">Guest</span>
                )}
              </div>

              {authError ? (
                <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-[10px]">
                  <div className="font-semibold">Auth Error</div>
                  <div className="mt-1 whitespace-pre-wrap break-words">{authError}</div>
                </div>
              ) : null}

              {user ? (
                <div className="mt-3 space-y-3">
                  <div className="text-[10px] text-white/70">
                    <div>
                      <span className="text-white/60">User:</span>{" "}
                      <span className="text-white/90">{maskEmail(user.email)}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-white/60">UID:</span>{" "}
                      <span className="text-white/80">{user.uid.slice(0, 8)}…</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onLogout}
                    disabled={authBusy}
                    className="mc-button mc-button-secondary w-full"
                  >
                    {authBusy ? "Signing out..." : "Log out"}
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className={`mc-button w-full ${authMode === "login" ? "" : "mc-button-secondary"}`}
                      disabled={authBusy}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className={`mc-button w-full ${authMode === "signup" ? "" : "mc-button-secondary"}`}
                      disabled={authBusy}
                    >
                      Sign up
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-white/70" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mc-select"
                      placeholder="you@example.com"
                      disabled={authBusy}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-white/70" htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mc-select"
                      placeholder="••••••••"
                      disabled={authBusy}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onAuthSubmit();
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onAuthSubmit}
                    disabled={authBusy}
                    className="mc-button w-full"
                  >
                    {authBusy ? "Working..." : authMode === "login" ? "Log in" : "Create account"}
                  </button>

                  <div className="text-[10px] text-white/55">
                    Enable <span className="text-white/80">Email/Password</span> in Firebase Console →
                    Authentication → Sign-in method.
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ====== MAIN APP (your existing UI) ====== */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="mc-panel rounded-2xl p-6 space-y-4">
            <div className="mc-section-title">Workbench Notes</div>
            <div className="space-y-2">
              <label className="text-xs text-white/70" htmlFor="idea">
                Idea Scroll
              </label>
              <textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="mc-textarea"
                placeholder="Example: Create a pack that gives players a random potion effect every 30 seconds..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/70" htmlFor="version">
                Version Rune
              </label>
              <select
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="mc-select"
              >
                {versions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {error ? (
              <div className="mc-panel rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs">
                <div className="font-semibold">Error</div>
                <pre className="mt-2 whitespace-pre-wrap break-words text-[10px]">{error}</pre>
              </div>
            ) : null}
          </div>

          <div className="mc-panel rounded-2xl p-6">
            <div className="mc-section-title">Furnace</div>
            <div className="mc-furnace-frame mt-4">
              <div className="mc-furnace-image">
                <img src={FURNACE_IMG_URL} alt="Furnace" className="mc-furnace-img" draggable={false} />
                <div className={`mc-slot mc-slot-overlay mc-slot-idea ${idea.trim() ? "mc-slot-active" : ""}`}>
                  <Image src={uncookedIcon} alt="Idea" className="mc-slot-icon-img" />
                </div>
                <div className={`mc-slot mc-slot-overlay mc-slot-fuel ${version ? "mc-slot-active" : ""}`}>
                  <Image src={coalIcon} alt="Coal" className="mc-slot-icon-img" />
                </div>
                <button
                  type="button"
                  onClick={onDownload}
                  disabled={!canDownload}
                  className={`mc-slot mc-slot-overlay mc-slot-output ${zipBlob ? "mc-slot-active" : ""}`}
                  aria-label="Download datapack"
                >
                  <Image src={cookedIcon} alt="Output" className="mc-slot-icon-img" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={onGenerate} disabled={!canGenerate} className="mc-button w-full">
                {isGenerating ? "Smelting..." : "Generate"}
              </button>
              <button type="button" onClick={onDownload} disabled={!canDownload} className="mc-button mc-button-secondary w-full">
                Download
              </button>
            </div>

            <div className="mt-4 text-[10px] text-white/60">
              {isGenerating ? "Furnace running. Forging datapack contents..." : "Load inputs, then smelt a datapack zip."}
            </div>
          </div>
        </section>

        <section className="mc-panel rounded-2xl p-6">
          <div className="mc-section-title">Generated File List</div>
          <div className="mc-output mt-3">
            {filesPreview.length ? (
              <pre className="whitespace-pre-wrap break-words text-[10px]">{filesPreview.join("\n")}</pre>
            ) : (
              <div className="text-[10px] text-white/60">No files yet. Click Generate.</div>
            )}
          </div>
        </section>

        <section className="mc-panel rounded-2xl p-6 common-downloads">
          <div className="mc-section-title">Commonly downloaded datapacks</div>
          <ul className="mt-2 text-[10px] space-y-1">
            <li>
              <a href="#" className="underline hover:text-accent">
                Speedrun helper pack
              </a>
            </li>
            <li>
              <a href="#" className="underline hover:text-accent">
                Mob farming improvements
              </a>
            </li>
            <li>
              <a href="#" className="underline hover:text-accent">
                Custom crafting tables
              </a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}