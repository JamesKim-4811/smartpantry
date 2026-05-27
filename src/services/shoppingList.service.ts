import { shoppingListRepository } from "../repositories/shoppingList.repository";
import { CreateShoppingListItemInput } from "../models";

export const shoppingListService = {
  getByHousehold(householdId: number) {
    return shoppingListRepository.findByHousehold(householdId);
  },

  addItem(input: CreateShoppingListItemInput) {
    const id = shoppingListRepository.createItem(input);
    return { item_id: id };
  },

  markPurchased(itemId: number, isPurchased: boolean) {
    shoppingListRepository.markPurchased(itemId, isPurchased);
    return { item_id: itemId, is_purchased: isPurchased };
  },

  deleteItem(itemId: number) {
    shoppingListRepository.deleteItem(itemId);
  },
};
