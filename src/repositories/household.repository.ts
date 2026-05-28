import prisma from "../db";
import { Household } from "../models";

export const householdRepository = {
  async findAll(): Promise<Household[]> {
    const rows = await prisma.household.findMany({ orderBy: { household_id: "asc" } });
    return rows.map((r) => ({ household_id: r.household_id, name: r.name }));
  },

  async findById(id: number): Promise<Household | undefined> {
    const row = await prisma.household.findUnique({ where: { household_id: id } });
    return row ? { household_id: row.household_id, name: row.name } : undefined;
  },

  async create(name: string): Promise<number> {
    const row = await prisma.household.create({ data: { name } });
    return row.household_id;
  },

  async update(id: number, name: string): Promise<void> {
    await prisma.household.update({ where: { household_id: id }, data: { name } });
  },

  async delete(id: number): Promise<void> {
    await prisma.household.delete({ where: { household_id: id } });
  },
};
