import prisma from "../db";
import {
  RecipeView,
  RecipeIngredientView,
  CreateRecipeInput,
  CreateRecipeIngredientInput,
} from "../models";

export interface RecipeIngredientRaw {
  food_item_id: number;
  quantity: number;
}

export const recipeRepository = {
  async findAll(): Promise<RecipeView[]> {
    const rows = await prisma.recipe.findMany({
      include: { created_by: true },
      orderBy: { name: "asc" },
    });
    return rows.map((r) => ({
      recipe_id: r.recipe_id,
      name: r.name,
      description: r.description,
      created_by_user_id: r.created_by_user_id,
      created_by: `${r.created_by.first_name} ${r.created_by.last_name}`,
    }));
  },

  async findIngredients(recipeId: number): Promise<RecipeIngredientView[]> {
    const rows = await prisma.recipeIngredient.findMany({
      where: { recipe_id: recipeId },
      include: { food_item: true, unit: true },
    });
    return rows.map((r) => ({
      recipe_ingredient_id: r.recipe_ingredient_id,
      food_item: r.food_item.name,
      quantity: r.quantity,
      unit_name: r.unit.unit_name,
    }));
  },

  async findIngredientsRaw(recipeId: number): Promise<RecipeIngredientRaw[]> {
    const rows = await prisma.recipeIngredient.findMany({
      where: { recipe_id: recipeId },
      select: { food_item_id: true, quantity: true },
    });
    return rows;
  },

  async findAllIds(): Promise<number[]> {
    const rows = await prisma.recipe.findMany({ select: { recipe_id: true } });
    return rows.map((r) => r.recipe_id);
  },

  async findById(recipeId: number): Promise<RecipeView | undefined> {
    const r = await prisma.recipe.findUnique({
      where: { recipe_id: recipeId },
      include: { created_by: true },
    });
    if (!r) return undefined;
    return {
      recipe_id: r.recipe_id,
      name: r.name,
      description: r.description,
      created_by_user_id: r.created_by_user_id,
      created_by: `${r.created_by.first_name} ${r.created_by.last_name}`,
    };
  },

  async create(input: CreateRecipeInput): Promise<number> {
    const row = await prisma.recipe.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        created_by_user_id: input.created_by_user_id,
      },
    });
    return row.recipe_id;
  },

  async addIngredient(recipeId: number, input: CreateRecipeIngredientInput): Promise<number> {
    const row = await prisma.recipeIngredient.create({
      data: {
        recipe_id: recipeId,
        food_item_id: input.food_item_id,
        unit_id: input.unit_id,
        quantity: input.quantity,
      },
    });
    return row.recipe_ingredient_id;
  },
};
