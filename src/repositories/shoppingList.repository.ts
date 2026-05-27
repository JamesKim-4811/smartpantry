import { query, execute } from "../queryHelper";
import { ShoppingListItemView, CreateShoppingListItemInput } from "../models";

export const shoppingListRepository = {
  findByHousehold(householdId: number): ShoppingListItemView[] {
    return query<ShoppingListItemView>(
      `SELECT
         sli.item_id, fi.name AS food_item, fi.food_item_id,
         sli.quantity, u.unit_name, u.unit_id,
         (usr.first_name || ' ' || usr.last_name) AS added_by,
         sli.added_by_user_id, sli.added_at,
         sli.is_purchased, sl.list_id, sl.household_id
       FROM ShoppingList sl
       JOIN ShoppingListItem sli ON sl.list_id = sli.list_id
       JOIN FoodItem fi ON sli.food_item_id = fi.food_item_id
       JOIN Unit u ON sli.unit_id = u.unit_id
       JOIN User usr ON sli.added_by_user_id = usr.user_id
       WHERE sl.household_id = ?
       ORDER BY sli.is_purchased ASC, sli.added_at ASC`,
      [householdId]
    );
  },

  createItem(input: CreateShoppingListItemInput): number {
    return execute(
      `INSERT INTO ShoppingListItem
         (list_id, food_item_id, unit_id, added_by_user_id, quantity, is_purchased, added_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [
        input.list_id,
        input.food_item_id,
        input.unit_id,
        input.added_by_user_id,
        input.quantity,
        new Date().toISOString(),
      ]
    );
  },

  markPurchased(itemId: number, isPurchased: boolean): void {
    execute(
      "UPDATE ShoppingListItem SET is_purchased = ? WHERE item_id = ?",
      [isPurchased ? 1 : 0, itemId]
    );
  },

  deleteItem(itemId: number): void {
    execute("DELETE FROM ShoppingListItem WHERE item_id = ?", [itemId]);
  },
};
