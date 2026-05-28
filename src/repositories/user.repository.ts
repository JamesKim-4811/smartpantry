import prisma from "../db";
import { User, CreateUserInput, UpdateUserInput, UserRole } from "../models";

export interface UserWithHousehold extends User {
  household_name: string;
}

export const userRepository = {
  async findByHousehold(householdId: number): Promise<UserWithHousehold[]> {
    const rows = await prisma.user.findMany({
      where: { household_id: householdId },
      include: { household: true },
      orderBy: [{ role: "asc" }, { last_name: "asc" }],
    });
    return rows.map((r) => ({
      user_id: r.user_id,
      first_name: r.first_name,
      last_name: r.last_name,
      email: r.email,
      password_hash: r.password_hash,
      role: r.role as UserRole,
      household_id: r.household_id,
      household_name: r.household.name,
    }));
  },

  async findById(id: number): Promise<User | undefined> {
    const row = await prisma.user.findUnique({ where: { user_id: id } });
    if (!row) return undefined;
    return {
      user_id: row.user_id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      password_hash: row.password_hash,
      role: row.role as UserRole,
      household_id: row.household_id,
    };
  },

  async create(input: CreateUserInput): Promise<number> {
    const row = await prisma.user.create({
      data: {
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email,
        password_hash: input.password_hash ?? "",
        role: input.role,
        household_id: input.household_id,
      },
    });
    return row.user_id;
  },

  async update(id: number, input: UpdateUserInput): Promise<void> {
    await prisma.user.update({
      where: { user_id: id },
      data: {
        first_name: input.first_name,
        last_name: input.last_name,
        email: input.email,
        role: input.role,
      },
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.user.delete({ where: { user_id: id } });
  },
};
