import type { ItemId } from "@/lib/inventory/items";
import { getMaxStack } from "@/lib/inventory/items";

export type ItemStack = { itemId: ItemId; count: number };
export type Slot = ItemStack | null;

export function createEmptySlots(count: number): Slot[] {
  return Array.from({ length: count }, () => null);
}

export function cloneSlots(slots: Slot[]): Slot[] {
  return slots.map((slot) => (slot ? { ...slot } : null));
}

export function normalizeSlot(slot: Slot): Slot {
  if (!slot) return null;
  if (slot.count <= 0) return null;
  return slot;
}

export function splitStack(slot: Slot): { picked: Slot; remaining: Slot } {
  if (!slot || slot.count <= 1) return { picked: null, remaining: slot };
  const half = Math.floor(slot.count / 2);
  return {
    picked: { itemId: slot.itemId, count: half },
    remaining: { itemId: slot.itemId, count: slot.count - half },
  };
}

export function takeAll(slot: Slot): { picked: Slot; remaining: Slot } {
  return { picked: slot ? { ...slot } : null, remaining: null };
}

export function placeAll(target: Slot, cursor: Slot): { target: Slot; cursor: Slot; changed: boolean } {
  if (!cursor) return { target, cursor, changed: false };

  if (!target) {
    return { target: { ...cursor }, cursor: null, changed: true };
  }

  if (target.itemId !== cursor.itemId) {
    return { target: { ...cursor }, cursor: { ...target }, changed: true };
  }

  const maxStack = getMaxStack(target.itemId);
  const space = maxStack - target.count;
  if (space <= 0) return { target, cursor, changed: false };

  const move = Math.min(space, cursor.count);
  const newTarget: Slot = { itemId: target.itemId, count: target.count + move };
  const remaining = cursor.count - move;
  const newCursor = remaining > 0 ? { itemId: cursor.itemId, count: remaining } : null;

  return { target: newTarget, cursor: newCursor, changed: true };
}

export function placeOne(target: Slot, cursor: Slot): { target: Slot; cursor: Slot; changed: boolean } {
  if (!cursor) return { target, cursor, changed: false };

  if (!target) {
    return {
      target: { itemId: cursor.itemId, count: 1 },
      cursor: cursor.count > 1 ? { itemId: cursor.itemId, count: cursor.count - 1 } : null,
      changed: true,
    };
  }

  if (target.itemId !== cursor.itemId) return { target, cursor, changed: false };

  const maxStack = getMaxStack(target.itemId);
  if (target.count >= maxStack) return { target, cursor, changed: false };

  return {
    target: { itemId: target.itemId, count: target.count + 1 },
    cursor: cursor.count > 1 ? { itemId: cursor.itemId, count: cursor.count - 1 } : null,
    changed: true,
  };
}
