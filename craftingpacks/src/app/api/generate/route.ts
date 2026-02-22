// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { generateDatapackSpec, repairDatapackSpec } from "@lib/gemini";
import { validateDatapack } from "@lib/validateDatapack";
import { zipDatapack } from "@lib/zipDatapack";
import { saveDatapack } from "@lib/datapackService";

export const runtime = "nodejs";

type GenerateRequest = {
  idea: string;
  version?: string;
  uid?: string | null;
};

export async function POST(req: Request) {
  let body: GenerateRequest;

  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const idea = typeof body.idea === "string" ? body.idea.trim() : "";
  const version =
    typeof body.version === "string" && body.version.trim()
      ? body.version.trim()
      : "1.20.1";

  // uid is optional (guest users can generate too)
  const uid = typeof body.uid === "string" && body.uid.trim() ? body.uid.trim() : null;

  if (!idea) {
    return NextResponse.json({ error: "idea is required." }, { status: 400 });
  }

  try {
    // 1) Generate spec with Gemini
    let spec = await generateDatapackSpec({ idea, version });

    // 2) Validate output
    let validation = validateDatapack(spec);
    let repairAttempts = 0;
    const maxRepairAttempts = 2;
    while (!validation.ok && repairAttempts < maxRepairAttempts) {
      repairAttempts += 1;
      spec = await repairDatapackSpec({ idea, version, spec, errors: validation.errors });
      validation = validateDatapack(spec);
    }
    const validationErrors = validation.ok ? [] : validation.errors;

    // 3) Save to Firestore (stores the full spec + uid)
    const id = await saveDatapack(spec, uid);

    // 4) Zip it up
    const zipBytes = await zipDatapack(spec);
    const zipBuffer = Buffer.from(zipBytes);

    // 5) Return zip as download + include metadata headers
    const filename = `${(spec.pack_name || "datapack").replace(/[^a-z0-9-_]+/gi, "_")}.zip`;
    const filesPreview = JSON.stringify(spec.files.map((f) => f.path));

    const validationHeader = validationErrors.length ? "failed" : "ok";
    const validationErrorsJson = validationErrors.length
      ? JSON.stringify(validationErrors).slice(0, 1800)
      : "";

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Datapack-Id": id,
        "X-Datapack-Pack-Name": spec.pack_name,
        "X-Datapack-Files": filesPreview,
        "X-Datapack-Validation": validationHeader,
        ...(validationErrorsJson
          ? { "X-Datapack-Validation-Errors": validationErrorsJson }
          : {}),
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