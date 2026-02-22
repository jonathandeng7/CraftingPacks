import type { DatapackSpec } from "./datapackPrompt";
import { generateDatapackSpec } from "./gemini";
import { validateDatapack } from "./validateDatapack";
import { zipDatapack } from "./zipDatapack";
import { saveDatapack } from "./datapackService";

export async function createDatapack(params: {
  idea: string;
  version: string;
  uid?: string | null; // <-- add
}): Promise<{
  id: string;
  spec: DatapackSpec;
  zip: Uint8Array;
}> {
  const spec = await generateDatapackSpec({
    idea: params.idea,
    version: params.version,
  });

  const validation = validateDatapack(spec);
  if (!validation.ok) {
    throw new Error("Datapack validation failed:\n" + validation.errors.join("\n"));
  }

  const id = await saveDatapack(spec, params.uid ?? null); // <-- pass uid
  const zip = await zipDatapack(spec);

  return { id, spec, zip };
}