import express from "express";
import cors from "cors";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import { householdRouter } from "./routes/household.routes";
import { userRouter } from "./routes/user.routes";
import { inventoryRouter } from "./routes/inventory.routes";
import {
  foodItemRouter,
  unitRouter,
  mealLogRouter,
  nutritionRouter,
  shoppingListRouter,
  recipeRouter,
  notificationRouter,
} from "./routes/domain.routes";

const PORT = process.env.PORT ?? 3001;

async function main() {
  const app = express();
  app.use(cors({ origin: "*" }));
  app.use(express.json());

  // ── Route registration ──────────────────────────────────────────────────────
  app.use("/api/households",     householdRouter);
  app.use("/api/users",          userRouter);
  app.use("/api/inventory",      inventoryRouter);
  app.use("/api/food-items",     foodItemRouter);
  app.use("/api/units",          unitRouter);
  app.use("/api/meal-logs",      mealLogRouter);
  app.use("/api/nutrition",      nutritionRouter);
  app.use("/api/shopping-list",  shoppingListRouter);
  app.use("/api/recipes",        recipeRouter);
  app.use("/api/notifications",  notificationRouter);

  // Health check
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Serve frontend static files (production)
  const publicDir = path.join(__dirname, "../public");
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));

  // Must be registered AFTER all routes
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`\n🚀 SmartPantry API → http://localhost:${PORT}`);
    console.log(`\nKey endpoints:`);
    console.log(`  GET  /api/households`);
    console.log(`  GET  /api/households/1/users`);
    console.log(`  GET  /api/inventory/household/1`);
    console.log(`  GET  /api/inventory/household/1/expiring?days=3`);
    console.log(`  GET  /api/nutrition/household/1`);
    console.log(`  GET  /api/shopping-list/household/1`);
    console.log(`  GET  /api/recipes/suggestions/household/1`);
    console.log(`  GET  /api/users/1/meal-logs`);
    console.log(`  GET  /api/users/1/notifications?unread=true\n`);
  });
}

main().catch(console.error);
