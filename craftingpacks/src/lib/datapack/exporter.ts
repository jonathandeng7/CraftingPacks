import JSZip from "jszip";
import { buildVeinminerFiles, buildVeinminerLoad, buildVeinminerTickEntry } from "@/lib/datapack/veinminer";

export type DatapackProject = {
  namespace: string;
  description: string;
  version: string;
  modules: string[];
};

export type DatapackFile = { path: string; content: string };

export type ExportResult = {
  blob: Blob;
  files: DatapackFile[];
};

const PACK_FORMAT = 15; // Minecraft 1.20.1

export function buildDatapackFiles(project: DatapackProject): DatapackFile[] {
  const { namespace, description, modules } = project;

  const files: DatapackFile[] = [];

  files.push({
    path: "pack.mcmeta",
    content: JSON.stringify(
      {
        pack: {
          pack_format: PACK_FORMAT,
          description,
        },
      },
      null,
      2,
    ),
  });

  files.push({
    path: "data/minecraft/tags/functions/load.json",
    content: JSON.stringify({ values: [`${namespace}:load`] }, null, 2),
  });

  files.push({
    path: "data/minecraft/tags/functions/tick.json",
    content: JSON.stringify({ values: [`${namespace}:tick`] }, null, 2),
  });

  const loadLines: string[] = [
    `tellraw @a {"text":"[CraftingPacks] Datapack loaded","color":"gold"}`,
  ];

  const tickLines: string[] = [];

  if (modules.includes("module:veinminer")) {
    // Register new module exporters alongside veinminer.
    loadLines.push(buildVeinminerLoad(namespace));
    tickLines.push(buildVeinminerTickEntry(namespace));

    const moduleFiles = buildVeinminerFiles(namespace);
    Object.entries(moduleFiles).forEach(([path, content]) => files.push({ path, content }));
  }

  files.push({
    path: `data/${namespace}/functions/load.mcfunction`,
    content: loadLines.join("\n"),
  });

  files.push({
    path: `data/${namespace}/functions/tick.mcfunction`,
    content: tickLines.join("\n"),
  });

  return files;
}

export async function exportDatapackZip(project: DatapackProject): Promise<ExportResult> {
  const zip = new JSZip();
  const files = buildDatapackFiles(project);

  for (const file of files) {
    zip.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  return { blob, files };
}
