import { query, execute } from "../queryHelper";
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
  findAll(): RecipeView[] {
    return query<RecipeView>(
      `SELECT r.recipe_id, r.name, r.description, r.created_by_user_id,
              (u.first_name || ' ' || u.last_name) AS created_by
       FROM Recipe r
       JOIN User u ON r.created_by_user_id = u.user_id
       ORDER BY r.name`
    );
  },

  findIngredients(recipeId: number): RecipeIngredientView[] {
    return query<RecipeIngredientView>(
      `SELECT ri.recipe_ingredient_id, fi.name AS food_item,
              ri.quantity, u.unit_name
       FROM RecipeIngredient ri
       JOIN FoodItem fi ON ri.food_item_id = fi.food_item_id
       JOIN Unit u ON ri.unit_id = u.unit_id
       WHERE ri.recipe_id = ?`,
      [recipeId]
    );
  },

  // Raw ingredients (with food_item_id) — used by recipe suggestion logic
  findIngredientsRaw(recipeId: number): RecipeIngredientRaw[] {
    return query<RecipeIngredientRaw>(
      "SELECT food_item_id, quantity FROM RecipeIngredient WHERE recipe_id = ?",
      [recipeId]
    );
  },

  findAllIds(): number[] {
    return query<{ recipe_id: number }>("SELECT recipe_id FROM Recipe").map(
      (r) => r.recipe_id
    );
  },

  findById(recipeId: number): RecipeView | undefined {
    return query<RecipeView>(
      `SELECT r.recipe_id, r.name, r.description, r.created_by_user_id,
              (u.first_name || ' ' || u.last_name) AS created_by
       FROM Recipe r
       JOIN User u ON r.created_by_user_id = u.user_id
       WHERE r.recipe_id = ?`,
      [recipeId]
    )[0];
  },

  create(input: CreateRecipeInput): number {
    return execute(
      "INSERT INTO Recipe (name, description, created_by_user_id) VALUES (?, ?, ?)",
      [input.name, input.description ?? null, input.created_by_user_id]
    );
  },

  addIngredient(recipeId: number, input: CreateRecipeIngredientInput): number {
    return execute(
      "INSERT INTO RecipeIngredient (recipe_id, food_item_id, unit_id, quantity) VALUES (?, ?, ?, ?)",
      [recipeId, input.food_item_id, input.unit_id, input.quantity]
    );
  },
};
