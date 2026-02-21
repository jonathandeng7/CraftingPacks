import type { ItemId } from "@/lib/inventory/items";
import { getItemDefinition } from "@/lib/inventory/items";
import type { Slot } from "@/lib/inventory/logic";

export type Recipe = {
  id: string;
  pattern: Array<ItemId | null>;
  output: ItemId;
  outputCount: number;
};

export const RECIPES: Recipe[] = [
  // Add new module recipes here to expand craftable modules.
  {
    id: "veinminer-module",
    pattern: [
      "minecraft:iron_ingot",
      "minecraft:redstone",
      "minecraft:iron_ingot",
      "minecraft:redstone",
      "minecraft:diamond",
      "minecraft:redstone",
      "minecraft:iron_ingot",
      "minecraft:book",
      "minecraft:iron_ingot",
    ],
    output: "module:veinminer",
    outputCount: 1,
  },
];

export function getCraftingOutput(grid: Slot[], recipes: Recipe[]): Recipe | null {
  const ids = grid.map((slot) => (slot ? slot.itemId : null));
  return recipes.find((recipe) => matchesPattern(ids, recipe.pattern)) || null;
}

export function consumeRecipe(grid: Slot[], recipe: Recipe): Slot[] {
  return grid.map((slot, idx) => {
    const required = recipe.pattern[idx];
    if (!required || !slot) return slot;
    const nextCount = slot.count - 1;
    return nextCount > 0 ? { ...slot, count: nextCount } : null;
  });
}

function matchesPattern(actual: Array<ItemId | null>, pattern: Array<ItemId | null>): boolean {
  if (actual.length !== pattern.length) return false;
  return pattern.every((item, idx) => item === actual[idx]);
}

export function describeRecipe(recipe: Recipe): string {
  const item = getItemDefinition(recipe.output);
  return item.name || recipe.id;
}
