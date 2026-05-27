// ─── DOMAIN MODELS ───────────────────────────────────────────────────────────
// These match the database schema. Used as return types from repositories
// and as input types for services.

export interface Household {
  household_id: number;
  name: string;
}

export type UserRole = "Admin" | "Member" | "Viewer";

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  household_id: number;
}

export interface FoodItem {
  food_item_id: number;
  name: string;
  calories_per_unit: number | null;
  protein_per_unit: number | null;
  carbs_per_unit: number | null;
  fat_per_unit: number | null;
}

export interface Unit {
  unit_id: number;
  unit_name: string;
  unit_type: string | null;
}

export type StorageLocation = "fridge" | "pantry" | "freezer";

export interface InventoryEntry {
  entry_id: number;
  household_id: number;
  food_item_id: number;
  unit_id: number;
  added_by_user_id: number;
  quantity: number;
  purchase_date: string;
  expiration_date: string | null;
  storage_location: StorageLocation;
}

// Enriched version returned by the inventory GET (joins food/unit/user names)
export interface InventoryEntryView extends InventoryEntry {
  food_item: string;
  unit_name: string;
  added_by: string;
  days_until_expiry: number | null;
}

export interface MealLog {
  meal_log_id: number;
  user_id: number;
  logged_at: string;
  notes: string | null;
}

export interface MealLogEntry {
  entry_id: number;
  meal_log_id: number;
  food_item_id: number;
  unit_id: number;
  quantity: number;
}

export interface MealLogEntryView {
  meal_log_id: number;
  logged_at: string;
  notes: string | null;
  food_item: string;
  quantity: number;
  unit_name: string;
  calories_consumed: number;
}

export interface NutritionSummary {
  user_id: number;
  member: string;
  household_id: number;
  log_date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export interface ShoppingList {
  list_id: number;
  household_id: number;
  created_at: string;
}

export interface ShoppingListItem {
  item_id: number;
  list_id: number;
  food_item_id: number;
  unit_id: number;
  added_by_user_id: number;
  quantity: number;
  is_purchased: boolean;
  added_at: string;
}

export interface ShoppingListItemView extends ShoppingListItem {
  food_item: string;
  unit_name: string;
  added_by: string;
}

export interface Recipe {
  recipe_id: number;
  name: string;
  description: string | null;
  created_by_user_id: number;
}

export interface RecipeView extends Recipe {
  created_by: string;
}

export interface RecipeIngredient {
  recipe_ingredient_id: number;
  recipe_id: number;
  food_item_id: number;
  unit_id: number;
  quantity: number;
}

export interface RecipeIngredientView {
  recipe_ingredient_id: number;
  food_item: string;
  quantity: number;
  unit_name: string;
}

export interface Notification {
  notification_id: number;
  user_id: number;
  message: string;
  created_at: string;
  is_read: boolean;
}

// ─── INPUT TYPES (what routes receive in req.body) ────────────────────────────

export type CreateHouseholdInput = Pick<Household, "name">;

export type CreateUserInput = Omit<User, "user_id">;
export type UpdateUserInput = Pick<User, "first_name" | "last_name" | "email" | "role">;

export type CreateFoodItemInput = Omit<FoodItem, "food_item_id">;
export type UpdateFoodItemInput = CreateFoodItemInput;

export type CreateInventoryEntryInput = Omit<InventoryEntry, "entry_id">;
export type UpdateInventoryEntryInput = Pick<
  InventoryEntry,
  "quantity" | "expiration_date" | "storage_location"
>;

export type CreateMealLogInput = Pick<MealLog, "user_id" | "notes"> & {
  logged_at?: string;
};
export type CreateMealLogEntryInput = Pick<
  MealLogEntry,
  "food_item_id" | "unit_id" | "quantity"
>;

export type CreateShoppingListItemInput = Pick<
  ShoppingListItem,
  "list_id" | "food_item_id" | "unit_id" | "added_by_user_id" | "quantity"
>;

export type CreateRecipeInput = Pick<Recipe, "name" | "description" | "created_by_user_id">;
export type CreateRecipeIngredientInput = Pick<
  RecipeIngredient,
  "food_item_id" | "unit_id" | "quantity"
>;

export type CreateNotificationInput = Pick<Notification, "user_id" | "message">;
