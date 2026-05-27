import { Router, Request, Response } from "express";
import { userService } from "../services/household.service";
import { mealLogService } from "../services/mealLog.service";
import { notificationService } from "../services/notification.service";

export const userRouter = Router();

userRouter.post("/", (req: Request, res: Response) => {
  const result = userService.create(req.body);
  res.status(201).json(result);
});

userRouter.put("/:id", (req: Request, res: Response) => {
  const result = userService.update(Number(req.params.id), req.body);
  res.json(result);
});

userRouter.delete("/:id", (req: Request, res: Response) => {
  userService.delete(Number(req.params.id));
  res.json({ deleted: true });
});

userRouter.get("/:userId/meal-logs", (req: Request, res: Response) => {
  res.json(mealLogService.getByUser(Number(req.params.userId)));
});

userRouter.get("/:userId/notifications", (req: Request, res: Response) => {
  const unreadOnly = req.query.unread === "true";
  res.json(notificationService.getByUser(Number(req.params.userId), unreadOnly));
});
