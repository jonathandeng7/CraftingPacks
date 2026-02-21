import JSZip from "jszip";
import type { DatapackSpec } from "@lib/datapackPrompt";

export async function zipDatapack(spec: DatapackSpec): Promise<Uint8Array> {
  const zip = new JSZip();

  for (const file of spec.files) {
    zip.file(file.path, file.content);
  }

  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
