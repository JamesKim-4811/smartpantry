import { Router, Request, Response } from "express";
import { inventoryService } from "../services/inventory.service";

export const inventoryRouter = Router();

// GET /api/households/:householdId/inventory
inventoryRouter.get("/household/:householdId", (req: Request, res: Response) => {
  res.json(inventoryService.getByHousehold(Number(req.params.householdId)));
});

// GET /api/households/:householdId/inventory/expiring?days=3
inventoryRouter.get("/household/:householdId/expiring", (req: Request, res: Response) => {
  const days = Number(req.query.days ?? 3);
  res.json(inventoryService.getExpiring(Number(req.params.householdId), days));
});

inventoryRouter.post("/", (req: Request, res: Response) => {
  const result = inventoryService.create(req.body);
  res.status(201).json(result);
});

inventoryRouter.put("/:id", (req: Request, res: Response) => {
  const result = inventoryService.update(Number(req.params.id), req.body);
  res.json(result);
});

inventoryRouter.delete("/:id", (req: Request, res: Response) => {
  inventoryService.delete(Number(req.params.id));
  res.json({ deleted: true });
});
