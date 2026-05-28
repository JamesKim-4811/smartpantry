import { mealLogRepository } from "../repositories/mealLog.repository";
import { CreateMealLogInput, CreateMealLogEntryInput } from "../models";

export const mealLogService = {
  getByUser(userId: number) {
    return mealLogRepository.findByUser(userId);
  },

  getNutritionSummary(householdId: number) {
    return mealLogRepository.getNutritionSummaryByHousehold(householdId);
  },

  async createLog(input: CreateMealLogInput) {
    const id = await mealLogRepository.createLog(input);
    return { meal_log_id: id };
  },

  async addEntry(logId: number, input: CreateMealLogEntryInput) {
    const id = await mealLogRepository.createEntry(logId, input);
    return { entry_id: id };
  },

  async deleteLog(logId: number) {
    await mealLogRepository.deleteLog(logId);
  },
};
