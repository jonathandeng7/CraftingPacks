import type { DatapackSpec } from "@lib/datapackPrompt";

export type DatapackValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

const MAX_FILES = 400;
const MAX_FILE_CHARS = 250_000; // prevent huge payloads

const ALLOWED_COMMAND_PREFIXES = [
  "execute",
  "scoreboard",
  "tellraw",
  "effect",
  "function",
  "schedule",
  "data",
  "tag",
  "give",
  "clear",
  "setblock",
  "fill",
  "summon",
  "kill",
  "tp",
  "teleport",
  "particle",
  "playsound",
  "title",
  "bossbar",
  "say",
];

const ALLOWED_SCORE_CRITERIA = ["dummy", "deathCount", "playerKillCount"];

function isAllowedCommand(line: string): boolean {
  const first = line.split(/\s+/)[0];
  return ALLOWED_COMMAND_PREFIXES.includes(first);
}

function hasInvalidCriteria(line: string): boolean {
  if (!line.startsWith("scoreboard objectives add ")) return false;
  const parts = line.split(/\s+/);
  const criterion = parts[3];
  if (!criterion) return true;
  if (ALLOWED_SCORE_CRITERIA.includes(criterion)) return false;
  if (criterion.startsWith("minecraft.custom:")) return false;
  if (criterion.startsWith("minecraft.mined:")) return false;
  return true;
}

function validateMcfunction(path: string, content: string, errors: string[]) {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    if (!isAllowedCommand(trimmed)) {
      errors.push(`Unsupported command in ${path} at line ${idx + 1}: ${trimmed}`);
      return;
    }

    if (trimmed.includes("minecraft.killed:")) {
      errors.push(`Invalid scoreboard criterion in ${path} at line ${idx + 1}: ${trimmed}`);
    }

    if (hasInvalidCriteria(trimmed)) {
      errors.push(`Invalid scoreboard criteria in ${path} at line ${idx + 1}: ${trimmed}`);
    }
  });
}

function isSafeRelativePath(path: string): boolean {
  if (typeof path !== "string") return false;
  if (path.length === 0) return false;
  if (path.startsWith("/") || path.startsWith("\\")) return false;
  if (path.includes("\u0000")) return false;
  if (path.includes("..")) return false;
  if (path.includes("\\")) return false;
  if (/^[A-Za-z]:\//.test(path)) return false; // windows drive
  return true;
}

export function validateDatapack(spec: DatapackSpec): DatapackValidationResult {
  const errors: string[] = [];

  if (!spec || typeof spec !== "object") {
    return { ok: false, errors: ["Response is not an object."] };
  }

  if (!spec.pack_name || typeof spec.pack_name !== "string") {
    errors.push("Missing required field: pack_name (string).\n");
  }

  if (!spec.description || typeof spec.description !== "string") {
    errors.push("Missing required field: description (string).\n");
  }

  if (!spec.installation_instructions || typeof spec.installation_instructions !== "string") {
    errors.push("Missing required field: installation_instructions (string).\n");
  }

  if (!Array.isArray(spec.files)) {
    errors.push("Missing required field: files (array).\n");
    return { ok: false, errors };
  }

  if (spec.files.length === 0) {
    errors.push("files must contain at least one file.");
  }

  if (spec.files.length > MAX_FILES) {
    errors.push(`Too many files (${spec.files.length}); max is ${MAX_FILES}.`);
  }

  const paths = new Set<string>();
  let hasPackMcmeta = false;
  let hasDataFile = false;
  let hasMcFunction = false;

  for (const file of spec.files) {
    if (!file || typeof file !== "object") {
      errors.push("Each item in files must be an object with path/content.");
      continue;
    }

    const { path, content } = file as { path?: unknown; content?: unknown };

    if (typeof path !== "string" || !isSafeRelativePath(path)) {
      errors.push(`Invalid file path: ${String(path)}`);
      continue;
    }

    if (paths.has(path)) {
      errors.push(`Duplicate file path: ${path}`);
      continue;
    }
    paths.add(path);

    if (typeof content !== "string" || content.trim().length === 0) {
      errors.push(`Empty or missing content for: ${path}`);
    }

    if (typeof content === "string" && content.length > MAX_FILE_CHARS) {
      errors.push(`File too large (${content.length} chars): ${path}`);
    }

    if (path === "pack.mcmeta") hasPackMcmeta = true;
    if (path.startsWith("data/")) hasDataFile = true;
    if (path.startsWith("data/") && path.endsWith(".mcfunction")) hasMcFunction = true;

    if (path.endsWith(".mcfunction") && typeof content === "string") {
      validateMcfunction(path, content, errors);
    }
  }

  if (!hasPackMcmeta) errors.push("Missing required file: pack.mcmeta");
  if (!hasDataFile) errors.push("Datapack must include at least one file under data/...");
  if (!hasMcFunction) errors.push("Datapack must include at least one .mcfunction under data/<namespace>/functions/");

  return errors.length ? { ok: false, errors } : { ok: true };
}
