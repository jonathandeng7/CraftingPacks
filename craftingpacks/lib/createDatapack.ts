import type { DatapackSpec } from "./datapackPrompt";
import { generateDatapackSpec } from "./gemini";
import { validateDatapack } from "./validateDatapack";
import { zipDatapack } from "./zipDatapack";
import { saveDatapack } from "./datapackService";

export async function createDatapack(params: {
  idea: string;
  version: string;
}): Promise<{
  id: string;
  spec: DatapackSpec;
  zip: Uint8Array;
}> {
  const spec = await generateDatapackSpec(params);

  const validation = validateDatapack(spec);
  if (!validation.ok) {
    throw new Error("Datapack validation failed:\n" + validation.errors.join("\n"));
  }

  const id = await saveDatapack(spec);
  const zip = await zipDatapack(spec);

  return { id, spec, zip };
}