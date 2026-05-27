import { query, execute } from "../queryHelper";
import { Household } from "../models";

export const householdRepository = {
  findAll(): Household[] {
    return query<Household>("SELECT * FROM Household ORDER BY household_id");
  },

  findById(id: number): Household | undefined {
    return query<Household>(
      "SELECT * FROM Household WHERE household_id = ?",
      [id]
    )[0];
  },

  create(name: string): number {
    return execute("INSERT INTO Household (name) VALUES (?)", [name]);
  },

  update(id: number, name: string): void {
    execute("UPDATE Household SET name = ? WHERE household_id = ?", [name, id]);
  },

  delete(id: number): void {
    execute("DELETE FROM Household WHERE household_id = ?", [id]);
  },
};
