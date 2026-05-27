import { foodItemRepository, unitRepository } from "../repositories/foodItem.repository";
import { CreateFoodItemInput, UpdateFoodItemInput } from "../models";

export const foodItemService = {
  getAll() {
    return foodItemRepository.findAll();
  },

  create(input: CreateFoodItemInput) {
    if (!input.name?.trim()) throw new Error("Food item name is required");
    const id = foodItemRepository.create(input);
    return { food_item_id: id, ...input };
  },

  update(id: number, input: UpdateFoodItemInput) {
    foodItemRepository.update(id, input);
    return { food_item_id: id, ...input };
  },

  delete(id: number) {
    foodItemRepository.delete(id);
  },
};

export const unitService = {
  getAll() {
    return unitRepository.findAll();
  },
};
