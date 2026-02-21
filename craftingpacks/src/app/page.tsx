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

  const versions = useMemo(
    () => ["1.20.1", "1.20.2", "1.20.4", "1.21"],
    [],
  );

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
          const details = data.details ? `\n${JSON.stringify(data.details, null, 2)}` : "";
          throw new Error(`${data.error || data.message || "Request failed."}${details}`);
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
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Minecraft Datapack Generator</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Describe what you want, generate a datapack zip.
        </p>

        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="idea">
              Idea
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="min-h-40 w-full rounded-md border bg-transparent p-3 text-sm"
              placeholder="Example: Create a pack that gives players a random potion effect every 30 seconds..."
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium" htmlFor="version">
                Minecraft version
              </label>
              <select
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="h-10 w-full rounded-md border bg-transparent px-3 text-sm"
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
              className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background disabled:opacity-60"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </button>

            <button
              type="button"
              onClick={onDownload}
              disabled={!canDownload}
              className="h-10 rounded-md border px-4 text-sm font-medium disabled:opacity-60"
            >
              Download
            </button>
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <div className="font-medium">Error</div>
              <pre className="mt-2 whitespace-pre-wrap break-words text-xs">{error}</pre>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="text-sm font-medium">Generated file list preview</div>
            <div className="rounded-md border bg-transparent p-3">
              {filesPreview.length ? (
                <pre className="whitespace-pre-wrap break-words text-xs">
                  {filesPreview.join("\n")}
                </pre>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No files yet. Click Generate.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
