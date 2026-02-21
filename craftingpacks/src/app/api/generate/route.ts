import { NextResponse } from "next/server";
import { generateDatapackSpec } from "@lib/gemini";
import { validateDatapack } from "@lib/validateDatapack";
import { zipDatapack } from "@lib/zipDatapack";

export const runtime = "nodejs";

type GenerateRequest = {
  idea: string;
  version?: string;
};

export async function POST(req: Request) {
  let body: GenerateRequest;

  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const idea = typeof body.idea === "string" ? body.idea.trim() : "";
  const version = typeof body.version === "string" && body.version.trim() ? body.version.trim() : "1.20.1";

  if (!idea) {
    return NextResponse.json({ error: "idea is required." }, { status: 400 });
  }

  try {
    const spec = await generateDatapackSpec({ idea, version });

    const validation = validateDatapack(spec);
    if (!validation.ok) {
      return NextResponse.json(
        {
          error: "Generated datapack did not pass validation.",
          details: validation.errors,
        },
        { status: 422 },
      );
    }

    const zipBytes = await zipDatapack(spec);
    const zipBuffer = Buffer.from(zipBytes);

    const filename = `${(spec.pack_name || "datapack").replace(/[^a-z0-9-_]+/gi, "_")}.zip`;
    const filesPreview = JSON.stringify(spec.files.map((f) => f.path));

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Datapack-Pack-Name": spec.pack_name,
        "X-Datapack-Files": filesPreview,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to generate datapack.",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
