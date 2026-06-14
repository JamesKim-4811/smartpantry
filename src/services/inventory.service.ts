import { inventoryRepository } from "../repositories/inventory.repository";
import { CreateInventoryEntryInput, UpdateInventoryEntryInput } from "../models";

export const inventoryService = {
  getByHousehold(householdId: number) {
    return inventoryRepository.findByHousehold(householdId);
  },

  getExpiring(householdId: number, withinDays = 3) {
    return inventoryRepository.findExpiring(householdId, withinDays);
  },

  async create(input: CreateInventoryEntryInput) {
    console.log("From inventory.service entry with input:", input);
    const id = await inventoryRepository.create(input);
    return { entry_id: id };
  },

  async update(id: number, input: UpdateInventoryEntryInput) {
    await inventoryRepository.update(id, input);
    console.log("From inventory.service update with input:", input);
    return { entry_id: id, ...input };
  },

  async delete(id: number) {
    await inventoryRepository.delete(id);
  },
};
