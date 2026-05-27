import { Router, Request, Response } from "express";
import { foodItemService, unitService } from "../services/foodItem.service";
import { mealLogService } from "../services/mealLog.service";
import { shoppingListService } from "../services/shoppingList.service";
import { recipeService } from "../services/recipe.service";
import { notificationService } from "../services/notification.service";

// ─── FOOD ITEMS ───────────────────────────────────────────────────────────────

export const foodItemRouter = Router();

foodItemRouter.get("/", (_req: Request, res: Response) => {
  res.json(foodItemService.getAll());
});

foodItemRouter.post("/", (req: Request, res: Response) => {
  const result = foodItemService.create(req.body);
  res.status(201).json(result);
});

foodItemRouter.put("/:id", (req: Request, res: Response) => {
  const result = foodItemService.update(Number(req.params.id), req.body);
  res.json(result);
});

foodItemRouter.delete("/:id", (req: Request, res: Response) => {
  foodItemService.delete(Number(req.params.id));
  res.json({ deleted: true });
});

// ─── UNITS ────────────────────────────────────────────────────────────────────

export const unitRouter = Router();

unitRouter.get("/", (_req: Request, res: Response) => {
  res.json(unitService.getAll());
});

// ─── MEAL LOGS ────────────────────────────────────────────────────────────────

export const mealLogRouter = Router();

mealLogRouter.post("/", (req: Request, res: Response) => {
  const result = mealLogService.createLog(req.body);
  res.status(201).json(result);
});

mealLogRouter.post("/:logId/entries", (req: Request, res: Response) => {
  const result = mealLogService.addEntry(Number(req.params.logId), req.body);
  res.status(201).json(result);
});

mealLogRouter.delete("/:id", (req: Request, res: Response) => {
  mealLogService.deleteLog(Number(req.params.id));
  res.json({ deleted: true });
});

// ─── NUTRITION (household-scoped) ─────────────────────────────────────────────
// Mounted at /api/nutrition

export const nutritionRouter = Router();

nutritionRouter.get("/household/:householdId", (req: Request, res: Response) => {
  res.json(mealLogService.getNutritionSummary(Number(req.params.householdId)));
});

// ─── SHOPPING LIST ────────────────────────────────────────────────────────────

export const shoppingListRouter = Router();

shoppingListRouter.get("/household/:householdId", (req: Request, res: Response) => {
  res.json(shoppingListService.getByHousehold(Number(req.params.householdId)));
});

shoppingListRouter.post("/items", (req: Request, res: Response) => {
  const result = shoppingListService.addItem(req.body);
  res.status(201).json(result);
});

shoppingListRouter.patch("/items/:id/purchased", (req: Request, res: Response) => {
  const result = shoppingListService.markPurchased(
    Number(req.params.id),
    req.body.is_purchased
  );
  res.json(result);
});

shoppingListRouter.delete("/items/:id", (req: Request, res: Response) => {
  shoppingListService.deleteItem(Number(req.params.id));
  res.json({ deleted: true });
});

// ─── RECIPES ─────────────────────────────────────────────────────────────────

export const recipeRouter = Router();

recipeRouter.get("/", (_req: Request, res: Response) => {
  res.json(recipeService.getAll());
});

recipeRouter.get("/suggestions/household/:householdId", (req: Request, res: Response) => {
  res.json(recipeService.getSuggestions(Number(req.params.householdId)));
});

recipeRouter.get("/:id/ingredients", (req: Request, res: Response) => {
  res.json(recipeService.getIngredients(Number(req.params.id)));
});

recipeRouter.post("/", (req: Request, res: Response) => {
  const result = recipeService.create(req.body);
  res.status(201).json(result);
});

recipeRouter.post("/:id/ingredients", (req: Request, res: Response) => {
  const result = recipeService.addIngredient(Number(req.params.id), req.body);
  res.status(201).json(result);
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const notificationRouter = Router();

notificationRouter.patch("/:id/read", (req: Request, res: Response) => {
  const result = notificationService.markRead(Number(req.params.id));
  res.json(result);
});

notificationRouter.post("/", (req: Request, res: Response) => {
  const result = notificationService.create(req.body);
  res.status(201).json(result);
});
