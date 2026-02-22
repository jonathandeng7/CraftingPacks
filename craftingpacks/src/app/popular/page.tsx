"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type PopularPack = {
  id: string;
  pack_name: string;
  description: string;
  version: string;
  download_url: string;
  downloads?: number;
};

export default function PopularPacksPage() {
  const [packs, setPacks] = useState<PopularPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const packsRef = collection(db, "popular_packs");
        const q = query(packsRef, orderBy("downloads", "desc"), limit(24));
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<PopularPack, "id">;
          return {
            id: doc.id,
            ...data,
          };
        });
        setPacks(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const hasPacks = useMemo(() => packs.length > 0, [packs]);

  return (
    <div className="min-h-screen px-6 py-12 text-foreground">
      <main className="mx-auto w-full max-w-5xl space-y-6">
        <header className="mc-panel rounded-2xl p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl">Popular Packs</h1>
              <p className="mt-2 text-xs text-white/70">
                Download community favorites stored in Firebase.
              </p>
            </div>
            <Link href="/" className="mc-button mc-button-secondary text-center">
              Back to Forge
            </Link>
          </div>
        </header>

        <section className="mc-panel rounded-2xl p-6">
          {loading ? (
            <div className="text-xs text-white/70">Loading popular packs...</div>
          ) : null}
          {error ? (
            <div className="mc-panel rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs">
              <div className="font-semibold">Error</div>
              <pre className="mt-2 whitespace-pre-wrap break-words text-[10px]">{error}</pre>
            </div>
          ) : null}

          {!loading && !error && !hasPacks ? (
            <div className="text-xs text-white/70">No popular packs found.</div>
          ) : null}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {packs.map((pack) => (
              <article key={pack.id} className="mc-panel rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm">{pack.pack_name}</div>
                    <div className="mt-1 text-[10px] text-white/60">
                      Version: {pack.version}
                    </div>
                  </div>
                  {typeof pack.downloads === "number" ? (
                    <div className="mc-badge">{pack.downloads} downloads</div>
                  ) : null}
                </div>
                <p className="mt-3 text-[10px] text-white/70">{pack.description}</p>
                <a
                  className="mc-button mt-4 block text-center"
                  href={pack.download_url}
                  download
                >
                  Download
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
