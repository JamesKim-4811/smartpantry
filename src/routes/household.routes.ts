import { Router, Request, Response, NextFunction } from "express";
import { householdService, userService } from "../services/household.service";

export const householdRouter = Router();

householdRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await householdService.getAll()); } catch (e) { next(e); }
});

householdRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await householdService.create(req.body.name)); } catch (e) { next(e); }
});

householdRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await householdService.update(Number(req.params.id), req.body.name)); } catch (e) { next(e); }
});

householdRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try { await householdService.delete(Number(req.params.id)); res.json({ deleted: true }); } catch (e) { next(e); }
});

// ─── Nested user routes under /households/:id ────────────────────────────────

householdRouter.get("/:householdId/users", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await userService.getByHousehold(Number(req.params.householdId))); } catch (e) { next(e); }
});

householdRouter.get("/:householdId/inventory", (req: Request, res: Response) => {
  res.redirect(`/api/inventory/household/${req.params.householdId}`);
});
