"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PopularPack = {
  id: string;
  name: string;
  description: string;
  version: string;
  filename: string;
  downloadUrl: string;
};

export default function PopularPacksPage() {
  const [packs, setPacks] = useState<PopularPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/popular-files", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load popular packs (${response.status}).`);
        }
        const data = (await response.json()) as { packs: PopularPack[] };
        setPacks(data.packs ?? []);
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
                Download local pack files from this project.
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
            {packs.map((pack) => {
              const isOpen = expandedId === pack.id;
              return (
                <article
                  key={pack.id}
                  className="mc-panel cursor-pointer rounded-2xl p-4"
                  onClick={() =>
                    setExpandedId((current) => (current === pack.id ? null : pack.id))
                  }
                >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm">{pack.name}</div>
                    <div className="mt-1 text-[10px] text-white/60">
                      File: {pack.filename}
                    </div>
                  </div>
                </div>
                <div
                  className={`mt-3 overflow-hidden text-[10px] transition-all duration-200 ease-out ${
                    isOpen ? "max-h-24 text-white/70" : "max-h-4 text-white/50"
                  }`}
                >
                  <p>{isOpen ? pack.description : "Click to view description"}</p>
                </div>
                <a
                  className="mc-button mt-4 block text-center"
                  href={pack.downloadUrl}
                  download
                >
                  Download
                </a>
              </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
