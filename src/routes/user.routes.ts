import { Router, Request, Response, NextFunction } from "express";
import { userService } from "../services/household.service";
import { mealLogService } from "../services/mealLog.service";
import { notificationService } from "../services/notification.service";

export const userRouter = Router();

userRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await userService.create(req.body)); } catch (e) { next(e); }
});

userRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await userService.update(Number(req.params.id), req.body)); } catch (e) { next(e); }
});

userRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try { await userService.delete(Number(req.params.id)); res.json({ deleted: true }); } catch (e) { next(e); }
});

userRouter.get("/:userId/meal-logs", async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await mealLogService.getByUser(Number(req.params.userId))); } catch (e) { next(e); }
});

userRouter.get("/:userId/notifications", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unreadOnly = req.query.unread === "true";
    res.json(await notificationService.getByUser(Number(req.params.userId), unreadOnly));
  } catch (e) { next(e); }
});
