import { recipeRepository } from "../repositories/recipe.repository";
import { inventoryRepository } from "../repositories/inventory.repository";
import { CreateRecipeInput, CreateRecipeIngredientInput, RecipeView } from "../models";

export const recipeService = {
  getAll() {
    return recipeRepository.findAll();
  },

  getIngredients(recipeId: number) {
    return recipeRepository.findIngredients(recipeId);
  },

  // Business logic: a recipe is "cookable" only if every required ingredient
  // has sufficient quantity in the household's current inventory.
  getSuggestions(householdId: number): RecipeView[] {
    const allRecipeIds = recipeRepository.findAllIds();
    const cookable: RecipeView[] = [];

    for (const recipeId of allRecipeIds) {
      const ingredients = recipeRepository.findIngredientsRaw(recipeId);

      const canCook = ingredients.every((ing) => {
        const stock = inventoryRepository.getTotalStock(householdId, ing.food_item_id);
        return stock >= ing.quantity;
      });

      if (canCook) {
        const recipe = recipeRepository.findById(recipeId);
        if (recipe) cookable.push(recipe);
      }
    }

    return cookable;
  },

  create(input: CreateRecipeInput) {
    const id = recipeRepository.create(input);
    return { recipe_id: id, name: input.name };
  },

  addIngredient(recipeId: number, input: CreateRecipeIngredientInput) {
    const id = recipeRepository.addIngredient(recipeId, input);
    return { recipe_ingredient_id: id };
  },
};
