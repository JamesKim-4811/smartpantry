import { Router, Request, Response, NextFunction } from "express";
import { foodItemService, unitService } from "../services/foodItem.service";
import { mealLogService } from "../services/mealLog.service";
import { shoppingListService } from "../services/shoppingList.service";
import { recipeService } from "../services/recipe.service";
import { notificationService } from "../services/notification.service";

// ─── FOOD ITEMS ───────────────────────────────────────────────────────────────

export const foodItemRouter = Router();

foodItemRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await foodItemService.getAll()); } catch (e) { next(e); }
});

foodItemRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await foodItemService.create(req.body)); } catch (e) { next(e); }
});

foodItemRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await foodItemService.update(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

foodItemRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try { await foodItemService.delete(Number(req.params.id)); res.json({ deleted: true }); } catch (e) { next(e); }
});

// ─── UNITS ────────────────────────────────────────────────────────────────────

export const unitRouter = Router();

unitRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await unitService.getAll()); } catch (e) { next(e); }
});

// ─── MEAL LOGS ────────────────────────────────────────────────────────────────

export const mealLogRouter = Router();

mealLogRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await mealLogService.createLog(req.body)); } catch (e) { next(e); }
});

mealLogRouter.post("/:logId/entries", async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await mealLogService.addEntry(Number(req.params.logId), req.body)); } catch (e) { next(e); }
});

mealLogRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try { await mealLogService.deleteLog(Number(req.params.id)); res.json({ deleted: true }); } catch (e) { next(e); }
});

// ─── NUTRITION (household-scoped) ─────────────────────────────────────────────

export const nutritionRouter = Router();

nutritionRouter.get("/household/:householdId", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await mealLogService.getNutritionSummary(Number(req.params.householdId))); } catch (e) { next(e); }
});

// ─── SHOPPING LIST ────────────────────────────────────────────────────────────

export const shoppingListRouter = Router();

shoppingListRouter.get("/household/:householdId", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await shoppingListService.getByHousehold(Number(req.params.householdId))); } catch (e) { next(e); }
});

shoppingListRouter.post("/items", async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await shoppingListService.addItem(req.body)); } catch (e) { next(e); }
});

shoppingListRouter.patch("/items/:id/purchased", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await shoppingListService.markPurchased(Number(req.params.id), req.body.is_purchased));
  } catch (e) { next(e); }
});

shoppingListRouter.delete("/items/:id", async (req: Request, res: Response, next: NextFunction) => {
  try { await shoppingListService.deleteItem(Number(req.params.id)); res.json({ deleted: true }); } catch (e) { next(e); }
});

// ─── RECIPES ─────────────────────────────────────────────────────────────────

export const recipeRouter = Router();

recipeRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try { res.json(await recipeService.getAll()); } catch (e) { next(e); }
});

recipeRouter.get("/suggestions/household/:householdId", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await recipeService.getSuggestions(Number(req.params.householdId))); } catch (e) { next(e); }
});

recipeRouter.get("/:id/ingredients", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await recipeService.getIngredients(Number(req.params.id))); } catch (e) { next(e); }
});

recipeRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await recipeService.create(req.body)); } catch (e) { next(e); }
});

recipeRouter.post("/:id/ingredients", async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await recipeService.addIngredient(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const notificationRouter = Router();

notificationRouter.patch("/:id/read", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await notificationService.markRead(Number(req.params.id))); } catch (e) { next(e); }
});

notificationRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await notificationService.create(req.body)); } catch (e) { next(e); }
});
