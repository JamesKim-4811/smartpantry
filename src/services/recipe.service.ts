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
  async getSuggestions(householdId: number): Promise<RecipeView[]> {
    const allRecipeIds = await recipeRepository.findAllIds();
    const cookable: RecipeView[] = [];

    for (const recipeId of allRecipeIds) {
      const ingredients = await recipeRepository.findIngredientsRaw(recipeId);

      let canCook = true;
      for (const ing of ingredients) {
        const stock = await inventoryRepository.getTotalStock(householdId, ing.food_item_id);
        if (stock < ing.quantity) { canCook = false; break; }
      }

      if (canCook) {
        const recipe = await recipeRepository.findById(recipeId);
        if (recipe) cookable.push(recipe);
      }
    }

    return cookable;
  },

  async create(input: CreateRecipeInput) {
    const id = await recipeRepository.create(input);
    return { recipe_id: id, name: input.name };
  },

  async addIngredient(recipeId: number, input: CreateRecipeIngredientInput) {
    const id = await recipeRepository.addIngredient(recipeId, input);
    return { recipe_ingredient_id: id };
  },
};
