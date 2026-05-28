import { foodItemRepository, unitRepository } from "../repositories/foodItem.repository";
import { CreateFoodItemInput, UpdateFoodItemInput } from "../models";

export const foodItemService = {
  getAll() {
    return foodItemRepository.findAll();
  },

  async create(input: CreateFoodItemInput) {
    if (!input.name?.trim()) throw new Error("Food item name is required");
    const id = await foodItemRepository.create(input);
    return { food_item_id: id, ...input };
  },

  async update(id: number, input: UpdateFoodItemInput) {
    await foodItemRepository.update(id, input);
    return { food_item_id: id, ...input };
  },

  async delete(id: number) {
    await foodItemRepository.delete(id);
  },
};

export const unitService = {
  getAll() {
    return unitRepository.findAll();
  },
};
