import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const PACKS_DIR = path.join(process.cwd(), "src", "app", "popularFiles");

function isSafeFilename(filename: string): boolean {
  if (!filename) return false;
  if (filename.includes("..") || filename.includes("/")) return false;
  if (!filename.toLowerCase().endsWith(".zip")) return false;
  return true;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  const decoded = decodeURIComponent(filename);
  if (!isSafeFilename(decoded)) {
    return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
  }

  const filePath = path.join(PACKS_DIR, decoded);

  try {
    const data = await readFile(filePath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${path.basename(decoded)}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "File not found.",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 404 },
    );
  }
}
