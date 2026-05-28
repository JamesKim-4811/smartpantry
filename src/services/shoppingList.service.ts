import { shoppingListRepository } from "../repositories/shoppingList.repository";
import { CreateShoppingListItemInput } from "../models";

export const shoppingListService = {
  getByHousehold(householdId: number) {
    return shoppingListRepository.findByHousehold(householdId);
  },

  async addItem(input: CreateShoppingListItemInput) {
    const id = await shoppingListRepository.createItem(input);
    return { item_id: id };
  },

  async markPurchased(itemId: number, isPurchased: boolean) {
    await shoppingListRepository.markPurchased(itemId, isPurchased);
    return { item_id: itemId, is_purchased: isPurchased };
  },

  async deleteItem(itemId: number) {
    await shoppingListRepository.deleteItem(itemId);
  },
};
