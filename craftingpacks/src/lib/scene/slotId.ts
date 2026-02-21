export type SlotGroup = "inventory" | "crafting" | "craftOutput" | "furnace" | "module";

export function slotKey(group: SlotGroup, index: number): string {
  return `${group}:${index}`;
}
