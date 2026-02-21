import type { ItemStack } from "@/lib/inventory/logic";
import { getItemDefinition } from "@/lib/inventory/items";

export function getTooltip(stack: ItemStack | null): string {
  if (!stack) return "";
  const item = getItemDefinition(stack.itemId);
  return item.name;
}
