export type DatapackSpec = {
  pack_name: string;
  description: string;
  files: Array<{ path: string; content: string }>;
  installation_instructions: string;
};

const JSON_SCHEMA = `{
  "pack_name": "string",
  "description": "string",
  "files": [{ "path": "string", "content": "string" }],
  "installation_instructions": "string"
}`;

export function buildDatapackPrompt(params: {
  idea: string;
  version: string;
}): string {
  const { idea, version } = params;

  // Keep the instructions tight: JSON only, no markdown fences.
  // We also nudge for a minimal-but-valid datapack structure.
  return [
    "You are an expert Minecraft datapack author.",
    `Minecraft version: ${version}`,
    "Task: Generate a COMPLETE datapack as a list of files.",
    "Return JSON ONLY (no markdown, no backticks, no commentary).",
    "The JSON MUST match exactly this schema:",
    JSON_SCHEMA,
    "Required datapack constraints:",
    "- Include a valid pack.mcmeta at path: pack.mcmeta",
    "- Include at least one namespace under data/<namespace>/...",
    "- Include at least one function file under data/<namespace>/functions/*.mcfunction",
    "- Prefer including load and tick entrypoints:",
    "  - data/minecraft/tags/functions/load.json",
    "  - data/minecraft/tags/functions/tick.json",
    "  - data/<namespace>/functions/load.mcfunction",
    "  - data/<namespace>/functions/tick.mcfunction",
    "- Ensure every file has non-empty content.",
    "- Use forward slashes in paths; no absolute paths; do not use '..'.",
    "- Keep files reasonably small; do not include binaries.",
    "- Use a safe lowercase namespace (e.g. 'craftingpacks').",
    "Pack goal / idea (implement this):",
    idea.trim(),
  ].join("\n");
}
