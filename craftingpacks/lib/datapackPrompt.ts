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

const VERSION_1201_PROMPT = `You are generating a Minecraft Java datapack for version 1.20.1.
Hard requirements (must follow):
Output a valid datapack structure with pack.mcmeta and a data/ folder at the datapack root.

Always create data/minecraft/tags/functions/load.json and data/minecraft/tags/functions/tick.json.

load.json must call <namespace>:load

tick.json must call <namespace>:tick

Never rely on @s unless you explicitly set execution context.

Any per-player logic that checks predicates or gives effects must run in player context using:

execute as @a at @s run function <namespace>:...

Predicate-based checks MUST be evaluated "as the player".

If you use if predicate <namespace>:holding_sword, ensure it is executed inside a function already running as that player (i.e., @s is the player).

Use correct 1.20.1 command syntax and resource IDs:

Prefer minecraft: prefixes for effects/items (e.g., minecraft:speed, minecraft:strength).

Keep tick logic minimal and testable:

Use short-duration effects (2s) refreshed during tick so effects automatically stop when conditions fail.

Required functional test pack to generate: "Adrenaline Combat Mode"
Namespace: example

Functions to include:

example:load prints a tellraw message to all players confirming load.

example:tick MUST run as each player with tag adrenaline:

execute as @a[tag=adrenaline] at @s run function example:tick_player_adrenaline

example:adrenaline_on adds tag adrenaline to @s and prints a message.

example:adrenaline_off removes tag and clears speed/strength.

example:adrenaline_toggle toggles tag.

example:tick_player_adrenaline contains ONLY:

If predicate example:holding_sword is true, give minecraft:speed and minecraft:strength for 2 seconds.

Predicates:

Create data/example/predicates/holding_sword.json that matches ANY sword in mainhand:

wooden, stone, iron, golden, diamond, netherite

Debug safeguards (must include in notes):
Explain how to verify the pack works:

/reload

/function example:adrenaline_on

Hold a sword -> buffs appear

Switch items -> buffs expire within 2s

If "works in chat but not in datapack", it is probably missing execute as @a at @s in tick.`;

export function buildDatapackPrompt(params: {
  idea: string;
  version: string;
}): string {
  const { idea, version } = params;
  const versionPrompt = version === "1.20.1" ? VERSION_1201_PROMPT : "";

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
    versionPrompt ? "" : "",
    versionPrompt,
    "Pack goal / idea (implement this):",
    idea.trim(),
  ].join("\n");
}
