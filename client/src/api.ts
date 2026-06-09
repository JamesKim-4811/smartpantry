const BASE = '/api'

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json()
}

// ── Households ──────────────────────────────────────────────────────────────

export const getHouseholds = () => req<Household[]>('/households')
export const getHouseholdUsers = (id: number) => req<User[]>(`/households/${id}/users`)

// ── Inventory ───────────────────────────────────────────────────────────────

export const getInventory = (householdId: number) =>
  req<InventoryEntry[]>(`/inventory/household/${householdId}`)
export const getExpiring = (householdId: number, days = 3) =>
  req<InventoryEntry[]>(`/inventory/household/${householdId}/expiring?days=${days}`)
export const createInventoryEntry = (body: Partial<InventoryEntry>) =>
  req('/inventory', { method: 'POST', body: JSON.stringify(body) })
export const updateInventoryEntry = (id: number, body: Partial<InventoryEntry>) =>
  req(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteInventoryEntry = (id: number) =>
  req(`/inventory/${id}`, { method: 'DELETE' })

// ── Food Items & Units ───────────────────────────────────────────────────────

export const getFoodItems = () => req<FoodItem[]>('/food-items')
export const getUnits = () => req<Unit[]>('/units')
export const createFoodItem = (body: Partial<FoodItem>) =>
  req('/food-items', { method: 'POST', body: JSON.stringify(body) })
export const deleteFoodItem = (id: number) =>
  req(`/food-items/${id}`, { method: 'DELETE' })

// ── Shopping List ────────────────────────────────────────────────────────────

export const getShoppingList = (householdId: number) =>
  req<ShoppingListItem[]>(`/shopping-list/household/${householdId}`)
export const addShoppingItem = (body: object) =>
  req('/shopping-list/items', { method: 'POST', body: JSON.stringify(body) })
export const markPurchased = (id: number, is_purchased: boolean) =>
  req(`/shopping-list/items/${id}/purchased`, {
    method: 'PATCH',
    body: JSON.stringify({ is_purchased }),
  })
export const deleteShoppingItem = (id: number) =>
  req(`/shopping-list/items/${id}`, { method: 'DELETE' })

// ── Meal Logs ────────────────────────────────────────────────────────────────

export const getUserMealLogs = (userId: number) =>
  req<MealLogEntry[]>(`/users/${userId}/meal-logs`)
export const createMealLog = (body: object) =>
  req('/meal-logs', { method: 'POST', body: JSON.stringify(body) })
export const addMealLogEntry = (logId: number, body: object) =>
  req(`/meal-logs/${logId}/entries`, { method: 'POST', body: JSON.stringify(body) })
export const deleteMealLog = (id: number) =>
  req(`/meal-logs/${id}`, { method: 'DELETE' })

// ── Nutrition ────────────────────────────────────────────────────────────────

export const getNutrition = (householdId: number) =>
  req<NutritionSummary[]>(`/nutrition/household/${householdId}`)

// ── Recipes ──────────────────────────────────────────────────────────────────

export const getRecipes = () => req<Recipe[]>('/recipes')
export const getRecipeSuggestions = (householdId: number) =>
  req<Recipe[]>(`/recipes/suggestions/household/${householdId}`)
export const getRecipeIngredients = (recipeId: number) =>
  req<RecipeIngredient[]>(`/recipes/${recipeId}/ingredients`)
export const createRecipe = (body: object) =>
  req('/recipes', { method: 'POST', body: JSON.stringify(body) })
export const addRecipeIngredient = (recipeId: number, body: object) =>
  req(`/recipes/${recipeId}/ingredients`, { method: 'POST', body: JSON.stringify(body) })

// ── Notifications ─────────────────────────────────────────────────────────────

export const getNotifications = (userId: number, unreadOnly = false) =>
  req<Notification[]>(`/users/${userId}/notifications${unreadOnly ? '?unread=true' : ''}`)
export const markNotificationRead = (id: number) =>
  req(`/notifications/${id}/read`, { method: 'PATCH' })

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Household { household_id: number; name: string }
export interface User {
  user_id: number; first_name: string; last_name: string
  email: string; role: string; household_id: number; household_name?: string
}
export interface FoodItem {
  food_item_id: number; name: string
  calories_per_unit: number | null; protein_per_unit: number | null
  carbs_per_unit: number | null; fat_per_unit: number | null
}
export interface Unit { unit_id: number; unit_name: string; unit_type: string | null }
export interface InventoryEntry {
  entry_id: number; household_id: number; food_item_id: number; unit_id: number
  added_by_user_id: number; quantity: number; purchase_date: string
  expiration_date: string | null; storage_location: string
  food_item: string; unit_name: string; added_by: string; days_until_expiry: number | null
}
export interface ShoppingListItem {
  item_id: number; list_id: number; food_item_id: number; unit_id: number
  added_by_user_id: number; quantity: number; is_purchased: boolean
  added_at: string; food_item: string; unit_name: string; added_by: string; household_id: number
}
export interface MealLogEntry {
  meal_log_id: number; logged_at: string; notes: string | null
  food_item: string; quantity: number; unit_name: string; calories_consumed: number
}
export interface NutritionSummary {
  user_id: number; member: string; household_id: number; log_date: string
  total_calories: number; total_protein: number; total_carbs: number; total_fat: number
}
export interface Recipe {
  recipe_id: number; name: string; description: string | null
  created_by_user_id: number; created_by: string
}
export interface RecipeIngredient {
  recipe_ingredient_id: number; food_item: string; quantity: number; unit_name: string
}
export interface Notification {
  notification_id: number; user_id: number; message: string
  created_at: string; is_read: boolean
}
