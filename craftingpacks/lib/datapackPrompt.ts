export type DatapackSpec = {
  pack_name: string;
  description: string;
  files: Array<{ path: string; content: string }>;
  installation_instructions: string;
};

export const DATAPACK_JSON_SCHEMA = `{
  "pack_name": "string",
  "description": "string",
  "files": [{ "path": "string", "content": "string" }],
  "installation_instructions": "string"
}`;

function buildVersionPrompt(version: string, packFormatLine: string): string {
  return `You are generating a Minecraft Java datapack for version ${version}.

Hard requirements (must follow):

${packFormatLine}

The datapack root MUST directly contain pack.mcmeta and data/ (no extra nested folders).

Output a valid datapack structure with pack.mcmeta and a data/ folder at the datapack root.

Always create data/minecraft/tags/functions/load.json and data/minecraft/tags/functions/tick.json.

load.json MUST call <namespace>:load

tick.json MUST call <namespace>:tick

Tag files MUST be located at data/minecraft/tags/functions/load.json and data/minecraft/tags/functions/tick.json (NOT under the custom namespace).

Predicate files MUST be located at data/<namespace>/predicates/

Function files MUST be located at data/<namespace>/functions/

Ensure every function referenced in tags or other functions actually exists at data/<namespace>/functions/<name>.mcfunction

Include in notes how to test functions manually using:
/function <namespace>:load
/function <namespace>:tick

Never rely on @s unless execution context is explicitly set.

All per-player logic MUST run in player execution context using:
execute as @a at @s run function <namespace>:...

Predicates MUST always be evaluated inside functions running as the player.

If using:
execute if predicate <namespace>:holding_sword

This MUST be inside a function called using:
execute as @a at @s run function <namespace>:...

Never evaluate predicates from server/global context.

Use correct Minecraft Java Edition ${version} command syntax and valid resource IDs.

Always use minecraft: prefixes for effects, items, and entities:
minecraft:speed
minecraft:strength
minecraft:netherite_sword

Never invent or guess scoreboard criteria.

Only use valid Minecraft 1.20.1 criteria.

Valid examples include:

minecraft.custom:minecraft.mob_kills
deathCount
playerKillCount
dummy

For tracking mob kills, ALWAYS use:
scoreboard objectives add <name> minecraft.custom:minecraft.mob_kills

NEVER use invalid criteria such as:
minecraft.killed:minecraft.mob

If unsure which criterion to use, use:
scoreboard objectives add <name> dummy

Tick logic MUST remain minimal, deterministic, and testable.

Use short-duration effects (2 seconds) refreshed during tick so effects automatically expire when conditions fail.

Never apply permanent effects from tick.

Guidelines for safe structure (generalized, not a specific pack):

- Use a single namespace (lowercase, no spaces) and keep functions under data/<namespace>/functions/.
- Use load.mcfunction for setup (scoreboard objectives, tags, initialization messages).
- Use tick.mcfunction for per-tick logic. It MUST call per-player functions via:
  execute as @a at @s run function <namespace>:...

If you introduce optional features, gate them with tags or scoreboard checks.

Predicates:

- Store predicates under data/<namespace>/predicates/.
- Always evaluate predicates inside a player-executed function (do NOT run them from server context).

Scoreboards:

- Use only valid criteria. If unsure, default to dummy.
- Example valid criteria forms:
  - dummy
  - deathCount
  - playerKillCount
  - minecraft.custom:<stat>
  - minecraft.mined:<block>

Effects and resources:

- Always use minecraft: prefixes for effects/items/entities.
- Use short durations (2 seconds) in tick logic.

Testing notes (must include in installation_instructions):

- /reload
- /function <namespace>:load
- /function <namespace>:tick

If a command works in chat but not in a datapack, it usually means execution context is missing execute as @a at @s in the tick pipeline.

The datapack MUST function automatically without requiring manual execution beyond initial testing commands.
`;
}

const VERSION_PROMPTS: Record<string, string> = Object.fromEntries(
  [
    "1.19",
    "1.19.1",
    "1.19.2",
    "1.19.3",
    "1.19.4",
    "1.20",
    "1.20.1",
    "1.20.2",
    "1.20.3",
    "1.20.4",
    "1.20.5",
    "1.20.6",
    "1.21.1",
    "1.21.2",
    "1.21.3",
  ].map((version) => {
    const packFormatLine =
      version === "1.20.1"
        ? 'pack.mcmeta MUST set "pack_format": 15 for Minecraft 1.20.1.'
        : `pack.mcmeta MUST set the correct pack_format for Minecraft ${version}.`;
    return [version, buildVersionPrompt(version, packFormatLine)];
  }),
);
export function buildDatapackPrompt(params: {
  idea: string;
  version: string;
}): string {
  const { idea, version } = params;
  const versionPrompt = VERSION_PROMPTS[version] || "";

  // Keep the instructions tight: JSON only, no markdown fences.
  // We also nudge for a minimal-but-valid datapack structure.
  return [
    "You are an expert Minecraft datapack author.",
    `Minecraft version: ${version}`,
    "Task: Generate a COMPLETE datapack as a list of files.",
    "Return JSON ONLY (no markdown, no backticks, no commentary).",
    "The JSON MUST match exactly this schema:",
    DATAPACK_JSON_SCHEMA,
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
    versionPrompt,
    "Pack goal / idea (implement this):",
    idea.trim(),
  ].join("\n");
}
