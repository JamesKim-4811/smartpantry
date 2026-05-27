import { query, execute } from "../queryHelper";
import { User, CreateUserInput, UpdateUserInput } from "../models";

export interface UserWithHousehold extends User {
  household_name: string;
}

export const userRepository = {
  findByHousehold(householdId: number): UserWithHousehold[] {
    return query<UserWithHousehold>(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.role,
              u.household_id, h.name AS household_name
       FROM User u
       JOIN Household h ON u.household_id = h.household_id
       WHERE u.household_id = ?
       ORDER BY u.role, u.last_name`,
      [householdId]
    );
  },

  findById(id: number): User | undefined {
    return query<User>("SELECT * FROM User WHERE user_id = ?", [id])[0];
  },

  create(input: CreateUserInput): number {
    return execute(
      `INSERT INTO User (first_name, last_name, email, password_hash, role, household_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.first_name,
        input.last_name,
        input.email,
        input.password_hash ?? "",
        input.role,
        input.household_id,
      ]
    );
  },

  update(id: number, input: UpdateUserInput): void {
    execute(
      `UPDATE User SET first_name = ?, last_name = ?, email = ?, role = ?
       WHERE user_id = ?`,
      [input.first_name, input.last_name, input.email, input.role, id]
    );
  },

  delete(id: number): void {
    execute("DELETE FROM User WHERE user_id = ?", [id]);
  },
};
