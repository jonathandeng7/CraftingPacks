"use client";

import { useMemo, useState } from "react";

const DEFAULT_VERSION = "1.20.1";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [version, setVersion] = useState(DEFAULT_VERSION);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [downloadName, setDownloadName] = useState<string>("datapack.zip");
  const [filesPreview, setFilesPreview] = useState<string[]>([]);

  const canGenerate = idea.trim().length > 0 && !isGenerating;
  const canDownload = Boolean(zipBlob);

  const versions = useMemo(() => ["1.20.1", "1.20.2", "1.20.4", "1.21"], []);

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
        body: JSON.stringify({ idea, version }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const data = (await res.json()) as { error?: string; message?: string; details?: unknown };
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
      <main className="mx-auto w-full max-w-4xl space-y-6">
        <header className="mc-panel rounded-2xl p-5">
          <h1 className="text-2xl">CraftingPacks Command Forge</h1>
          <p className="mt-2 text-xs text-white/70">
            Describe a datapack idea, then generate a Minecraft-ready zip.
          </p>
        </header>

        <section className="mc-panel rounded-2xl p-5 space-y-4">
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

          <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
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

            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate}
              className="mc-button"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>

            <button
              type="button"
              onClick={onDownload}
              disabled={!canDownload}
              className="mc-button mc-button-secondary"
            >
              Download
            </button>
          </div>

          {error ? (
            <div className="mc-panel rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs">
              <div className="font-semibold">Error</div>
              <pre className="mt-2 whitespace-pre-wrap break-words text-[10px]">{error}</pre>
            </div>
          ) : null}
        </section>

        <section className="mc-panel rounded-2xl p-5">
          <div className="text-xs text-white/70">Generated file list</div>
          <div className="mc-output mt-3">
            {filesPreview.length ? (
              <pre className="whitespace-pre-wrap break-words text-[10px]">
                {filesPreview.join("\n")}
              </pre>
            ) : (
              <div className="text-[10px] text-white/60">No files yet. Click Generate.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
