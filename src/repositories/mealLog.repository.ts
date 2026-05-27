import { query, execute } from "../queryHelper";
import {
  MealLogEntryView,
  NutritionSummary,
  CreateMealLogInput,
  CreateMealLogEntryInput,
} from "../models";

export const mealLogRepository = {
  findByUser(userId: number): MealLogEntryView[] {
    return query<MealLogEntryView>(
      `SELECT
         ml.meal_log_id, ml.logged_at, ml.notes,
         fi.name AS food_item, mle.quantity, u.unit_name,
         ROUND(mle.quantity * fi.calories_per_unit, 2) AS calories_consumed
       FROM MealLog ml
       JOIN MealLogEntry mle ON ml.meal_log_id = mle.meal_log_id
       JOIN FoodItem fi ON mle.food_item_id = fi.food_item_id
       JOIN Unit u ON mle.unit_id = u.unit_id
       WHERE ml.user_id = ?
       ORDER BY ml.logged_at DESC`,
      [userId]
    );
  },

  getNutritionSummaryByHousehold(householdId: number): NutritionSummary[] {
    return query<NutritionSummary>(
      `SELECT
         u.user_id,
         (u.first_name || ' ' || u.last_name) AS member,
         u.household_id,
         DATE(ml.logged_at) AS log_date,
         ROUND(SUM(mle.quantity * fi.calories_per_unit), 2) AS total_calories,
         ROUND(SUM(mle.quantity * fi.protein_per_unit), 2)  AS total_protein,
         ROUND(SUM(mle.quantity * fi.carbs_per_unit), 2)    AS total_carbs,
         ROUND(SUM(mle.quantity * fi.fat_per_unit), 2)      AS total_fat
       FROM MealLog ml
       JOIN User u ON ml.user_id = u.user_id
       JOIN MealLogEntry mle ON ml.meal_log_id = mle.meal_log_id
       JOIN FoodItem fi ON mle.food_item_id = fi.food_item_id
       WHERE u.household_id = ?
       GROUP BY u.user_id, DATE(ml.logged_at)
       ORDER BY log_date DESC, member`,
      [householdId]
    );
  },

  createLog(input: CreateMealLogInput): number {
    return execute(
      "INSERT INTO MealLog (user_id, logged_at, notes) VALUES (?, ?, ?)",
      [
        input.user_id,
        input.logged_at ?? new Date().toISOString(),
        input.notes ?? null,
      ]
    );
  },

  createEntry(logId: number, input: CreateMealLogEntryInput): number {
    return execute(
      "INSERT INTO MealLogEntry (meal_log_id, food_item_id, unit_id, quantity) VALUES (?, ?, ?, ?)",
      [logId, input.food_item_id, input.unit_id, input.quantity]
    );
  },

  deleteLog(logId: number): void {
    execute("DELETE FROM MealLogEntry WHERE meal_log_id = ?", [logId]);
    execute("DELETE FROM MealLog WHERE meal_log_id = ?", [logId]);
  },
};
