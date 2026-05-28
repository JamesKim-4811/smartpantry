import prisma from "../db";
import { FoodItem, Unit, CreateFoodItemInput, UpdateFoodItemInput } from "../models";

export const foodItemRepository = {
  async findAll(): Promise<FoodItem[]> {
    return prisma.foodItem.findMany({ orderBy: { name: "asc" } });
  },

  async findById(id: number): Promise<FoodItem | undefined> {
    const row = await prisma.foodItem.findUnique({ where: { food_item_id: id } });
    return row ?? undefined;
  },

  async create(input: CreateFoodItemInput): Promise<number> {
    const row = await prisma.foodItem.create({
      data: {
        name: input.name,
        calories_per_unit: input.calories_per_unit ?? null,
        protein_per_unit: input.protein_per_unit ?? null,
        carbs_per_unit: input.carbs_per_unit ?? null,
        fat_per_unit: input.fat_per_unit ?? null,
      },
    });
    return row.food_item_id;
  },

  async update(id: number, input: UpdateFoodItemInput): Promise<void> {
    await prisma.foodItem.update({
      where: { food_item_id: id },
      data: {
        name: input.name,
        calories_per_unit: input.calories_per_unit ?? null,
        protein_per_unit: input.protein_per_unit ?? null,
        carbs_per_unit: input.carbs_per_unit ?? null,
        fat_per_unit: input.fat_per_unit ?? null,
      },
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.foodItem.delete({ where: { food_item_id: id } });
  },
};

export const unitRepository = {
  async findAll(): Promise<Unit[]> {
    return prisma.unit.findMany({ orderBy: { unit_name: "asc" } });
  },

  async findById(id: number): Promise<Unit | undefined> {
    const row = await prisma.unit.findUnique({ where: { unit_id: id } });
    return row ?? undefined;
  },
};
