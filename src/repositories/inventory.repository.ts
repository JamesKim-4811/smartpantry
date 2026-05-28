import prisma from "../db";
import {
  InventoryEntryView,
  StorageLocation,
  CreateInventoryEntryInput,
  UpdateInventoryEntryInput,
} from "../models";

function daysUntilExpiry(expirationDate: string | null): number | null {
  if (!expirationDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expirationDate);
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function toView(entry: {
  entry_id: number;
  household_id: number;
  food_item_id: number;
  unit_id: number;
  added_by_user_id: number;
  quantity: number;
  purchase_date: string;
  expiration_date: string | null;
  storage_location: string;
  food_item: { name: string };
  unit: { unit_name: string };
  added_by: { first_name: string; last_name: string };
}): InventoryEntryView {
  return {
    entry_id: entry.entry_id,
    household_id: entry.household_id,
    food_item_id: entry.food_item_id,
    unit_id: entry.unit_id,
    added_by_user_id: entry.added_by_user_id,
    quantity: entry.quantity,
    purchase_date: entry.purchase_date,
    expiration_date: entry.expiration_date,
    storage_location: entry.storage_location as StorageLocation,
    food_item: entry.food_item.name,
    unit_name: entry.unit.unit_name,
    added_by: `${entry.added_by.first_name} ${entry.added_by.last_name}`,
    days_until_expiry: daysUntilExpiry(entry.expiration_date),
  };
}

const includeRelations = {
  food_item: true,
  unit: true,
  added_by: true,
} as const;

export const inventoryRepository = {
  async findByHousehold(householdId: number): Promise<InventoryEntryView[]> {
    const rows = await prisma.inventoryEntry.findMany({
      where: { household_id: householdId },
      include: includeRelations,
      orderBy: { expiration_date: "asc" },
    });
    return rows.map(toView);
  },

  async findExpiring(householdId: number, withinDays: number): Promise<InventoryEntryView[]> {
    const rows = await prisma.inventoryEntry.findMany({
      where: {
        household_id: householdId,
        expiration_date: { not: null },
      },
      include: includeRelations,
      orderBy: { expiration_date: "asc" },
    });
    return rows
      .map(toView)
      .filter(
        (e) =>
          e.days_until_expiry !== null &&
          e.days_until_expiry >= 0 &&
          e.days_until_expiry <= withinDays
      );
  },

  async getTotalStock(householdId: number, foodItemId: number): Promise<number> {
    const result = await prisma.inventoryEntry.aggregate({
      where: { household_id: householdId, food_item_id: foodItemId },
      _sum: { quantity: true },
    });
    return result._sum.quantity ?? 0;
  },

  async create(input: CreateInventoryEntryInput): Promise<number> {
    const row = await prisma.inventoryEntry.create({
      data: {
        household_id: input.household_id,
        food_item_id: input.food_item_id,
        unit_id: input.unit_id,
        added_by_user_id: input.added_by_user_id,
        quantity: input.quantity,
        purchase_date: input.purchase_date,
        expiration_date: input.expiration_date ?? null,
        storage_location: input.storage_location,
      },
    });
    return row.entry_id;
  },

  async update(id: number, input: UpdateInventoryEntryInput): Promise<void> {
    await prisma.inventoryEntry.update({
      where: { entry_id: id },
      data: {
        quantity: input.quantity,
        expiration_date: input.expiration_date ?? null,
        storage_location: input.storage_location,
      },
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.inventoryEntry.delete({ where: { entry_id: id } });
  },
};
