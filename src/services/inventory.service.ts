import { inventoryRepository } from "../repositories/inventory.repository";
import { CreateInventoryEntryInput, UpdateInventoryEntryInput } from "../models";

export const inventoryService = {
  getByHousehold(householdId: number) {
    return inventoryRepository.findByHousehold(householdId);
  },

  getExpiring(householdId: number, withinDays = 3) {
    return inventoryRepository.findExpiring(householdId, withinDays);
  },

  create(input: CreateInventoryEntryInput) {
    const id = inventoryRepository.create(input);
    return { entry_id: id };
  },

  update(id: number, input: UpdateInventoryEntryInput) {
    inventoryRepository.update(id, input);
    return { entry_id: id, ...input };
  },

  delete(id: number) {
    inventoryRepository.delete(id);
  },
};
