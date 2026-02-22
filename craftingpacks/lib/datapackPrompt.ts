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

Required functional test pack to generate: "Adrenaline Combat Mode"

Namespace: example

Functions to include:

example:load
- MUST print a tellraw confirmation message to all players confirming datapack loaded

example:tick
- MUST run per-player logic using:
execute as @a[tag=adrenaline] at @s run function example:tick_player_adrenaline

example:adrenaline_on
- MUST add tag adrenaline to @s
- MUST print confirmation message

example:adrenaline_off
- MUST remove tag adrenaline
- MUST clear minecraft:speed and minecraft:strength

example:adrenaline_toggle
- MUST toggle adrenaline tag on @s

example:tick_player_adrenaline
- MUST ONLY apply effects when predicate example:holding_sword is true
- MUST use:
execute if predicate example:holding_sword run effect give @s minecraft:speed 2 0 true
execute if predicate example:holding_sword run effect give @s minecraft:strength 2 0 true

Predicates:

Create data/example/predicates/holding_sword.json

It MUST detect mainhand swords using equipment.mainhand.items list.

Include ALL swords:
minecraft:wooden_sword
minecraft:stone_sword
minecraft:iron_sword
minecraft:golden_sword
minecraft:diamond_sword
minecraft:netherite_sword

Debug safeguards (must include in notes):

Explain how to verify datapack works:

1. Run:
/reload

2. Enable adrenaline:
/function example:adrenaline_on

3. Hold a sword -> buffs appear

4. Switch items -> buffs expire within 2 seconds

5. Test predicate manually:
/execute as @p at @s if predicate example:holding_sword run say WORKING

If a command works in chat but not datapack, it means execution context is missing execute as @a at @s in tick pipeline.

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
    versionPrompt,
    "Pack goal / idea (implement this):",
    idea.trim(),
  ].join("\n");
}
