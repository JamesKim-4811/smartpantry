import { Router, Request, Response } from "express";
import { householdService, userService } from "../services/household.service";

export const householdRouter = Router();

householdRouter.get("/", (_req: Request, res: Response) => {
  res.json(householdService.getAll());
});

householdRouter.post("/", (req: Request, res: Response) => {
  const result = householdService.create(req.body.name);
  res.status(201).json(result);
});

householdRouter.put("/:id", (req: Request, res: Response) => {
  const result = householdService.update(Number(req.params.id), req.body.name);
  res.json(result);
});

householdRouter.delete("/:id", (req: Request, res: Response) => {
  householdService.delete(Number(req.params.id));
  res.json({ deleted: true });
});

// ─── Nested user routes under /households/:id ────────────────────────────────

householdRouter.get("/:householdId/users", (req: Request, res: Response) => {
  res.json(userService.getByHousehold(Number(req.params.householdId)));
});

householdRouter.get("/:householdId/inventory", (req: Request, res: Response) => {
  // Delegated to inventoryRouter, but registered here to keep URL structure
  // This avoids splitting /households/:id routes across files
  res.redirect(`/api/inventory/household/${req.params.householdId}`);
});
