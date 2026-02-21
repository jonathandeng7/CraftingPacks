export type ItemId = string;

export type ItemDefinition = {
  id: ItemId;
  name: string;
  maxStack: number;
  tint: string;
  label: string;
  category: "material" | "tool" | "module" | "fuel";
};

const ITEMS: Record<ItemId, ItemDefinition> = {
  "minecraft:iron_ingot": {
    id: "minecraft:iron_ingot",
    name: "Iron Ingot",
    maxStack: 64,
    tint: "#cbd5e1",
    label: "Fe",
    category: "material",
  },
  "minecraft:redstone": {
    id: "minecraft:redstone",
    name: "Redstone Dust",
    maxStack: 64,
    tint: "#dc2626",
    label: "Rs",
    category: "material",
  },
  "minecraft:diamond": {
    id: "minecraft:diamond",
    name: "Diamond",
    maxStack: 64,
    tint: "#22d3ee",
    label: "Di",
    category: "material",
  },
  "minecraft:book": {
    id: "minecraft:book",
    name: "Book",
    maxStack: 64,
    tint: "#f5f5f4",
    label: "Bk",
    category: "material",
  },
  "minecraft:raw_iron": {
    id: "minecraft:raw_iron",
    name: "Raw Iron",
    maxStack: 64,
    tint: "#9ca3af",
    label: "Ri",
    category: "material",
  },
  "minecraft:coal": {
    id: "minecraft:coal",
    name: "Coal",
    maxStack: 64,
    tint: "#111827",
    label: "Co",
    category: "fuel",
  },
  "minecraft:stick": {
    id: "minecraft:stick",
    name: "Stick",
    maxStack: 64,
    tint: "#a16207",
    label: "St",
    category: "material",
  },
  "minecraft:iron_pickaxe": {
    id: "minecraft:iron_pickaxe",
    name: "Iron Pickaxe",
    maxStack: 1,
    tint: "#94a3b8",
    label: "Px",
    category: "tool",
  },
  "module:veinminer": {
    id: "module:veinminer",
    name: "Veinminer Module",
    maxStack: 1,
    tint: "#16a34a",
    label: "Vm",
    category: "module",
  },
};

export function getItemDefinition(id: ItemId): ItemDefinition {
  return ITEMS[id] || {
    id,
    name: id,
    maxStack: 64,
    tint: "#94a3b8",
    label: "??",
    category: "material",
  };
}

export function getMaxStack(id: ItemId): number {
  return getItemDefinition(id).maxStack;
}

export const STARTER_ITEMS: Array<{ id: ItemId; count: number }> = [
  { id: "minecraft:iron_ingot", count: 16 },
  { id: "minecraft:redstone", count: 16 },
  { id: "minecraft:diamond", count: 4 },
  { id: "minecraft:book", count: 8 },
  { id: "minecraft:iron_pickaxe", count: 1 },
  { id: "minecraft:raw_iron", count: 8 },
  { id: "minecraft:coal", count: 8 },
  { id: "minecraft:stick", count: 16 },
];
