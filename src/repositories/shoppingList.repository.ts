import prisma from "../db";
import { ShoppingListItemView, CreateShoppingListItemInput } from "../models";

export const shoppingListRepository = {
  async findByHousehold(householdId: number): Promise<ShoppingListItemView[]> {
    const list = await prisma.shoppingList.findUnique({
      where: { household_id: householdId },
      include: {
        items: {
          include: {
            food_item: true,
            unit: true,
            added_by: true,
          },
          orderBy: [{ is_purchased: "asc" }, { added_at: "asc" }],
        },
      },
    });
    if (!list) return [];
    return list.items.map((item) => ({
      item_id: item.item_id,
      list_id: item.list_id,
      food_item_id: item.food_item_id,
      food_item: item.food_item.name,
      unit_id: item.unit_id,
      unit_name: item.unit.unit_name,
      added_by_user_id: item.added_by_user_id,
      added_by: `${item.added_by.first_name} ${item.added_by.last_name}`,
      quantity: item.quantity,
      is_purchased: item.is_purchased,
      added_at: item.added_at,
      household_id: list.household_id,
    }));
  },

  async createItem(input: CreateShoppingListItemInput): Promise<number> {
    const row = await prisma.shoppingListItem.create({
      data: {
        list_id: input.list_id,
        food_item_id: input.food_item_id,
        unit_id: input.unit_id,
        added_by_user_id: input.added_by_user_id,
        quantity: input.quantity,
        is_purchased: false,
        added_at: new Date().toISOString(),
      },
    });
    return row.item_id;
  },

  async markPurchased(itemId: number, isPurchased: boolean): Promise<void> {
    await prisma.shoppingListItem.update({
      where: { item_id: itemId },
      data: { is_purchased: isPurchased },
    });
  },

  async deleteItem(itemId: number): Promise<void> {
    await prisma.shoppingListItem.delete({ where: { item_id: itemId } });
  },
};
