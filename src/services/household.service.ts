import { householdRepository } from "../repositories/household.repository";
import { userRepository } from "../repositories/user.repository";
import { CreateUserInput, UpdateUserInput } from "../models";

export const householdService = {
  getAll() {
    return householdRepository.findAll();
  },

  create(name: string) {
    if (!name?.trim()) throw new Error("Household name is required");
    const id = householdRepository.create(name.trim());
    return { household_id: id, name };
  },

  update(id: number, name: string) {
    if (!name?.trim()) throw new Error("Household name is required");
    householdRepository.update(id, name.trim());
    return { household_id: id, name };
  },

  delete(id: number) {
    householdRepository.delete(id);
  },
};

export const userService = {
  getByHousehold(householdId: number) {
    return userRepository.findByHousehold(householdId);
  },

  create(input: CreateUserInput) {
    const { first_name, last_name, email, role, household_id } = input;
    if (!first_name || !last_name || !email || !role || !household_id) {
      throw new Error("Missing required fields: first_name, last_name, email, role, household_id");
    }
    const id = userRepository.create(input);
    return { user_id: id, first_name, last_name, email, role };
  },

  update(id: number, input: UpdateUserInput) {
    userRepository.update(id, input);
    return { user_id: id, ...input };
  },

  delete(id: number) {
    userRepository.delete(id);
  },
};
