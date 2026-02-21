const ORES = [
  { id: "minecraft:coal_ore", key: "coal", obj: "vm_coal" },
  { id: "minecraft:deepslate_coal_ore", key: "dcoal", obj: "vm_dcoal" },
  { id: "minecraft:iron_ore", key: "iron", obj: "vm_iron" },
  { id: "minecraft:deepslate_iron_ore", key: "diron", obj: "vm_diron" },
  { id: "minecraft:gold_ore", key: "gold", obj: "vm_gold" },
  { id: "minecraft:deepslate_gold_ore", key: "dgold", obj: "vm_dgold" },
  { id: "minecraft:diamond_ore", key: "dia", obj: "vm_dia" },
  { id: "minecraft:deepslate_diamond_ore", key: "ddia", obj: "vm_ddia" },
  { id: "minecraft:emerald_ore", key: "emer", obj: "vm_emer" },
  { id: "minecraft:deepslate_emerald_ore", key: "demer", obj: "vm_demer" },
  { id: "minecraft:redstone_ore", key: "red", obj: "vm_red" },
  { id: "minecraft:deepslate_redstone_ore", key: "dred", obj: "vm_dred" },
  { id: "minecraft:lapis_ore", key: "lap", obj: "vm_lap" },
  { id: "minecraft:deepslate_lapis_ore", key: "dlap", obj: "vm_dlap" },
  { id: "minecraft:copper_ore", key: "cop", obj: "vm_cop" },
  { id: "minecraft:deepslate_copper_ore", key: "dcop", obj: "vm_dcop" },
  { id: "minecraft:nether_quartz_ore", key: "nq", obj: "vm_nq" },
  { id: "minecraft:nether_gold_ore", key: "ng", obj: "vm_ng" },
] as const;

type OreDef = (typeof ORES)[number];

export function buildVeinminerFiles(namespace: string): Record<string, string> {
  const files: Record<string, string> = {};
  const base = `data/${namespace}/functions/modules/veinminer`;

  files[`${base}/tick.mcfunction`] = buildTick(namespace);

  for (const ore of ORES) {
    files[`${base}/scan_${ore.key}.mcfunction`] = buildScan(namespace, ore);
    files[`${base}/flood_${ore.key}.mcfunction`] = buildFlood(namespace, ore);
  }

  return files;
}

export function buildVeinminerLoad(namespace: string): string {
  const lines = ["scoreboard objectives add vm_cooldown dummy"];
  for (const ore of ORES) {
    lines.push(`scoreboard objectives add ${ore.obj} minecraft.mined:${ore.id}`);
  }
  lines.push(`tellraw @a {\"text\":\"[Veinminer] Loaded\",\"color\":\"green\"}`);
  return lines.join("\n");
}

export function buildVeinminerTickEntry(namespace: string): string {
  return `execute as @a at @s run function ${namespace}:modules/veinminer/tick`;
}

function buildTick(namespace: string): string {
  const lines = [
    "scoreboard players remove @s vm_cooldown 1",
  ];

  for (const ore of ORES) {
    lines.push(
      `execute unless score @s vm_cooldown matches 1.. if score @s ${ore.obj} matches 1.. run function ${namespace}:modules/veinminer/scan_${ore.key}`,
    );
  }

  for (const ore of ORES) {
    lines.push(`scoreboard players set @s ${ore.obj} 0`);
  }

  return lines.join("\n");
}

function buildScan(namespace: string, ore: OreDef): string {
  const lines = [
    "scoreboard players set @s vm_cooldown 20",
  ];

  for (const offset of scanOffsets()) {
    lines.push(
      `execute at @s positioned ~${offset.x} ~${offset.y} ~${offset.z} if block ~ ~ ~ ${ore.id} run function ${namespace}:modules/veinminer/flood_${ore.key}`,
    );
  }

  return lines.join("\n");
}

function buildFlood(namespace: string, ore: OreDef): string {
  const fn = `${namespace}:modules/veinminer/flood_${ore.key}`;
  return [
    `execute if block ~ ~ ~ ${ore.id} run setblock ~ ~ ~ air destroy`,
    `execute if block ~1 ~ ~ ${ore.id} run function ${fn}`,
    `execute if block ~-1 ~ ~ ${ore.id} run function ${fn}`,
    `execute if block ~ ~1 ~ ${ore.id} run function ${fn}`,
    `execute if block ~ ~-1 ~ ${ore.id} run function ${fn}`,
    `execute if block ~ ~ ~1 ${ore.id} run function ${fn}`,
    `execute if block ~ ~ ~-1 ${ore.id} run function ${fn}`,
  ].join("\n");
}

function scanOffsets(): Array<{ x: number; y: number; z: number }> {
  const offsets: Array<{ x: number; y: number; z: number }> = [];
  for (let y = -1; y <= 1; y += 1) {
    for (let x = -1; x <= 1; x += 1) {
      for (let z = -1; z <= 1; z += 1) {
        offsets.push({ x, y, z });
      }
    }
  }
  return offsets;
}
