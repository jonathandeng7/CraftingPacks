import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PACKS_DIR = path.join(process.cwd(), "src", "app", "popularFiles");

const DISPLAY_NAME_MAP: Record<string, string> = {
  "spawnanimations-v1.11.3-mc1.17-1.21.11-datapack.zip": "Spawn Animations",
  "Hearths v1.0.5.dp.zip": "Hearts",
  "tru.e-ending-1.1.4d.zip": "True Ending - Ender Dragon Overhaul",
  "Shingeki-no-Craft_2.2.4.1.zip": "Shingeki no Craft | Attack on Titan",
  "Villager Transportation v1.3.1 1.20 - 1.20.4.zip": "Villager Transportation",
  "playerhealthindicator.zip": "Health Indicator",
};

const DESCRIPTION_MAP: Record<string, string> = {
  "spawnanimations-v1.11.3-mc1.17-1.21.11-datapack.zip":
    "Hostile mobs dig out of the ground or poof into existence when they spawn!",
  "Hearths v1.0.5.dp.zip": "A handful of additions to vanilla Nether biomes",
  "tru.e-ending-1.1.4d.zip":
    "An Ender Dragon overhaul with progressing difficulty, new attacks, and elegant particle animation.",
  "Shingeki-no-Craft_2.2.4.1.zip":
    "Experience Attack on Titan inside Minecraft Vanilla! Features Titan Shifters, ODM gear, cannons, Pure Titans, Thunder Spears, firearms, royal blood mechanics, quests, modified villages, and more — all created using only command blocks, with no mods required.",
  "Villager Transportation v1.3.1 1.20 - 1.20.4.zip":
    "Makes transporting villagers easier and more practical by allowing them to travel using camels and llamas, simplifying long-distance movement and village management.",
  "playerhealthindicator.zip":
    "Displays each player’s health directly below their name, allowing for better combat awareness and multiplayer gameplay clarity.",
};

function parseFilename(filename: string): {
  name: string;
  version: string;
  description: string;
} {
  const base = filename.replace(/\.zip$/i, "");
  const match = base.match(/-(\d+\.\d+(?:\.\d+)?)$/);
  const version = match ? match[1] : "unknown";
  const namePart = match ? base.slice(0, -match[0].length) : base;
  const name = namePart.replace(/[-_]+/g, " ").trim();

  return {
    name: name || base,
    version,
    description: "Local pack file",
  };
}

export async function GET() {
  try {
    const entries = await readdir(PACKS_DIR, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".zip"))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, "en"));

    const packs = files.map((filename) => {
      const displayName = DISPLAY_NAME_MAP[filename];
      const displayDescription = DESCRIPTION_MAP[filename];
      const { name, version, description } = parseFilename(filename);
      return {
        id: filename,
        name: displayName || name,
        version,
        description: displayDescription || description,
        filename,
        downloadUrl: `/api/popular-files/${encodeURIComponent(filename)}`,
      };
    });

    return NextResponse.json({ packs });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to read popular files.",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
