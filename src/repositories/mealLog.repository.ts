import prisma from "../db";
import {
  MealLogEntryView,
  NutritionSummary,
  CreateMealLogInput,
  CreateMealLogEntryInput,
} from "../models";

export const mealLogRepository = {
  async findByUser(userId: number): Promise<MealLogEntryView[]> {
    const logs = await prisma.mealLog.findMany({
      where: { user_id: userId },
      include: {
        entries: {
          include: { food_item: true, unit: true },
        },
      },
      orderBy: { logged_at: "desc" },
    });

    const views: MealLogEntryView[] = [];
    for (const log of logs) {
      for (const entry of log.entries) {
        views.push({
          meal_log_id: log.meal_log_id,
          logged_at: log.logged_at,
          notes: log.notes,
          food_item: entry.food_item.name,
          quantity: entry.quantity,
          unit_name: entry.unit.unit_name,
          calories_consumed:
            Math.round(entry.quantity * (entry.food_item.calories_per_unit ?? 0) * 100) / 100,
        });
      }
    }
    return views;
  },

  async getNutritionSummaryByHousehold(householdId: number): Promise<NutritionSummary[]> {
    const logs = await prisma.mealLog.findMany({
      where: { user: { household_id: householdId } },
      include: {
        user: true,
        entries: { include: { food_item: true } },
      },
      orderBy: { logged_at: "desc" },
    });

    // Group by user + date
    const map = new Map<string, NutritionSummary>();
    for (const log of logs) {
      const logDate = log.logged_at.split("T")[0];
      const key = `${log.user_id}:${logDate}`;
      if (!map.has(key)) {
        map.set(key, {
          user_id: log.user_id,
          member: `${log.user.first_name} ${log.user.last_name}`,
          household_id: log.user.household_id,
          log_date: logDate,
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
        });
      }
      const summary = map.get(key)!;
      for (const entry of log.entries) {
        const fi = entry.food_item;
        summary.total_calories += entry.quantity * (fi.calories_per_unit ?? 0);
        summary.total_protein  += entry.quantity * (fi.protein_per_unit  ?? 0);
        summary.total_carbs    += entry.quantity * (fi.carbs_per_unit    ?? 0);
        summary.total_fat      += entry.quantity * (fi.fat_per_unit      ?? 0);
      }
    }

    // Round and sort
    return Array.from(map.values())
      .map((s) => ({
        ...s,
        total_calories: Math.round(s.total_calories * 100) / 100,
        total_protein:  Math.round(s.total_protein  * 100) / 100,
        total_carbs:    Math.round(s.total_carbs    * 100) / 100,
        total_fat:      Math.round(s.total_fat      * 100) / 100,
      }))
      .sort((a, b) =>
        b.log_date.localeCompare(a.log_date) || a.member.localeCompare(b.member)
      );
  },

  async createLog(input: CreateMealLogInput): Promise<number> {
    const row = await prisma.mealLog.create({
      data: {
        user_id: input.user_id,
        logged_at: input.logged_at ?? new Date().toISOString(),
        notes: input.notes ?? null,
      },
    });
    return row.meal_log_id;
  },

  async createEntry(logId: number, input: CreateMealLogEntryInput): Promise<number> {
    const row = await prisma.mealLogEntry.create({
      data: {
        meal_log_id: logId,
        food_item_id: input.food_item_id,
        unit_id: input.unit_id,
        quantity: input.quantity,
      },
    });
    return row.entry_id;
  },

  async deleteLog(logId: number): Promise<void> {
    await prisma.mealLogEntry.deleteMany({ where: { meal_log_id: logId } });
    await prisma.mealLog.delete({ where: { meal_log_id: logId } });
  },
};
