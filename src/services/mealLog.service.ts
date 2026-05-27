import { mealLogRepository } from "../repositories/mealLog.repository";
import { CreateMealLogInput, CreateMealLogEntryInput } from "../models";

export const mealLogService = {
  getByUser(userId: number) {
    return mealLogRepository.findByUser(userId);
  },

  getNutritionSummary(householdId: number) {
    return mealLogRepository.getNutritionSummaryByHousehold(householdId);
  },

  createLog(input: CreateMealLogInput) {
    const id = mealLogRepository.createLog(input);
    return { meal_log_id: id };
  },

  addEntry(logId: number, input: CreateMealLogEntryInput) {
    const id = mealLogRepository.createEntry(logId, input);
    return { entry_id: id };
  },

  deleteLog(logId: number) {
    mealLogRepository.deleteLog(logId);
  },
};
