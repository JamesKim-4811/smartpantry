import { query, execute } from "../queryHelper";
import {
  InventoryEntryView,
  CreateInventoryEntryInput,
  UpdateInventoryEntryInput,
} from "../models";

export const inventoryRepository = {
  findByHousehold(householdId: number): InventoryEntryView[] {
    return query<InventoryEntryView>(
      `SELECT
         ie.entry_id, fi.name AS food_item, fi.food_item_id,
         ie.quantity, u.unit_name, u.unit_id,
         ie.storage_location, ie.expiration_date, ie.purchase_date,
         ie.household_id, ie.added_by_user_id,
         (julianday(ie.expiration_date) - julianday('now')) AS days_until_expiry,
         (usr.first_name || ' ' || usr.last_name) AS added_by
       FROM InventoryEntry ie
       JOIN FoodItem fi ON ie.food_item_id = fi.food_item_id
       JOIN Unit u ON ie.unit_id = u.unit_id
       JOIN User usr ON ie.added_by_user_id = usr.user_id
       WHERE ie.household_id = ?
       ORDER BY ie.expiration_date ASC`,
      [householdId]
    );
  },

  findExpiring(householdId: number, withinDays: number): InventoryEntryView[] {
    return query<InventoryEntryView>(
      `SELECT
         ie.entry_id, fi.name AS food_item, fi.food_item_id,
         ie.quantity, u.unit_name, u.unit_id,
         ie.storage_location, ie.expiration_date, ie.purchase_date,
         ie.household_id, ie.added_by_user_id,
         CAST(julianday(ie.expiration_date) - julianday('now') AS INTEGER) AS days_until_expiry,
         (usr.first_name || ' ' || usr.last_name) AS added_by
       FROM InventoryEntry ie
       JOIN FoodItem fi ON ie.food_item_id = fi.food_item_id
       JOIN Unit u ON ie.unit_id = u.unit_id
       JOIN User usr ON ie.added_by_user_id = usr.user_id
       WHERE ie.household_id = ?
         AND ie.expiration_date IS NOT NULL
         AND (julianday(ie.expiration_date) - julianday('now')) <= ?
         AND (julianday(ie.expiration_date) - julianday('now')) >= 0
       ORDER BY ie.expiration_date ASC`,
      [householdId, withinDays]
    );
  },

  // Used by recipe suggestion logic
  getTotalStock(householdId: number, foodItemId: number): number {
    const result = query<{ total: number }>(
      `SELECT COALESCE(SUM(quantity), 0) AS total
       FROM InventoryEntry
       WHERE household_id = ? AND food_item_id = ?`,
      [householdId, foodItemId]
    );
    return result[0]?.total ?? 0;
  },

  create(input: CreateInventoryEntryInput): number {
    return execute(
      `INSERT INTO InventoryEntry
         (household_id, food_item_id, unit_id, added_by_user_id, quantity, purchase_date, expiration_date, storage_location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.household_id,
        input.food_item_id,
        input.unit_id,
        input.added_by_user_id,
        input.quantity,
        input.purchase_date,
        input.expiration_date ?? null,
        input.storage_location,
      ]
    );
  },

  update(id: number, input: UpdateInventoryEntryInput): void {
    execute(
      `UPDATE InventoryEntry SET quantity = ?, expiration_date = ?, storage_location = ?
       WHERE entry_id = ?`,
      [input.quantity, input.expiration_date ?? null, input.storage_location, id]
    );
  },

  delete(id: number): void {
    execute("DELETE FROM InventoryEntry WHERE entry_id = ?", [id]);
  },
};
