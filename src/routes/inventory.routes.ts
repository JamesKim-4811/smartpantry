import { Router, Request, Response, NextFunction } from "express";
import { inventoryService } from "../services/inventory.service";

export const inventoryRouter = Router();

inventoryRouter.get("/household/:householdId", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await inventoryService.getByHousehold(Number(req.params.householdId))); } catch (e) { next(e); }
});

inventoryRouter.get("/household/:householdId/expiring", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = Number(req.query.days ?? 3);
    res.json(await inventoryService.getExpiring(Number(req.params.householdId), days));
  } catch (e) { next(e); }
});

inventoryRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await inventoryService.create(req.body)); } catch (e) { next(e); }
});

inventoryRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await inventoryService.update(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

inventoryRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try { await inventoryService.delete(Number(req.params.id)); res.json({ deleted: true }); } catch (e) { next(e); }
});
