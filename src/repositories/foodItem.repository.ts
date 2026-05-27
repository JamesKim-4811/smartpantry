import { query, execute } from "../queryHelper";
import { FoodItem, Unit, CreateFoodItemInput, UpdateFoodItemInput } from "../models";

export const foodItemRepository = {
  findAll(): FoodItem[] {
    return query<FoodItem>("SELECT * FROM FoodItem ORDER BY name");
  },

  findById(id: number): FoodItem | undefined {
    return query<FoodItem>(
      "SELECT * FROM FoodItem WHERE food_item_id = ?",
      [id]
    )[0];
  },

  create(input: CreateFoodItemInput): number {
    return execute(
      `INSERT INTO FoodItem (name, calories_per_unit, protein_per_unit, carbs_per_unit, fat_per_unit)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.name,
        input.calories_per_unit ?? null,
        input.protein_per_unit ?? null,
        input.carbs_per_unit ?? null,
        input.fat_per_unit ?? null,
      ]
    );
  },

  update(id: number, input: UpdateFoodItemInput): void {
    execute(
      `UPDATE FoodItem SET name = ?, calories_per_unit = ?, protein_per_unit = ?,
       carbs_per_unit = ?, fat_per_unit = ? WHERE food_item_id = ?`,
      [
        input.name,
        input.calories_per_unit ?? null,
        input.protein_per_unit ?? null,
        input.carbs_per_unit ?? null,
        input.fat_per_unit ?? null,
        id,
      ]
    );
  },

  delete(id: number): void {
    execute("DELETE FROM FoodItem WHERE food_item_id = ?", [id]);
  },
};

export const unitRepository = {
  findAll(): Unit[] {
    return query<Unit>("SELECT * FROM Unit ORDER BY unit_name");
  },

  findById(id: number): Unit | undefined {
    return query<Unit>("SELECT * FROM Unit WHERE unit_id = ?", [id])[0];
  },
};
