import { householdRepository } from "../repositories/household.repository";
import { userRepository } from "../repositories/user.repository";
import { CreateUserInput, UpdateUserInput } from "../models";

export const householdService = {
  getAll() {
    return householdRepository.findAll();
  },

  async create(name: string) {
    if (!name?.trim()) throw new Error("Household name is required");
    const id = await householdRepository.create(name.trim());
    return { household_id: id, name };
  },

  async update(id: number, name: string) {
    if (!name?.trim()) throw new Error("Household name is required");
    await householdRepository.update(id, name.trim());
    return { household_id: id, name };
  },

  async delete(id: number) {
    await householdRepository.delete(id);
  },
};

export const userService = {
  getByHousehold(householdId: number) {
    return userRepository.findByHousehold(householdId);
  },

  async create(input: CreateUserInput) {
    const { first_name, last_name, email, role, household_id } = input;
    if (!first_name || !last_name || !email || !role || !household_id) {
      throw new Error("Missing required fields: first_name, last_name, email, role, household_id");
    }
    const id = await userRepository.create(input);
    return { user_id: id, first_name, last_name, email, role };
  },

  async update(id: number, input: UpdateUserInput) {
    await userRepository.update(id, input);
    return { user_id: id, ...input };
  },

  async delete(id: number) {
    await userRepository.delete(id);
  },
};
