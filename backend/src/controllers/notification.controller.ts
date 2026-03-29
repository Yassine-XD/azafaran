import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";
import { notificationService } from "../services/notification.service";

export const notificationController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await notificationService.getUserNotifications(userId, {
      page,
      limit,
    });
    return success(res, result.data, 200, result.pagination);
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await notificationService.markAsRead(id);
    return success(res, { message: "Notificación marcada como leída" });
  }),

  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    await notificationService.markAllAsRead(userId);
    return success(res, { message: "Todas las notificaciones marcadas como leídas" });
  }),
};
