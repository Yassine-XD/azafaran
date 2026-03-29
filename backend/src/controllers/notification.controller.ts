/**
 * Notification Controller
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import notificationService from "../services/notification.service";

class NotificationController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { page = 1, limit = 20 } = req.query;
    const result = await notificationService.getUserNotifications(userId, {
      page: Number(page),
      limit: Number(limit),
    });
    res.json(new ApiResponse(200, result, "Notifications retrieved"));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const notification = await notificationService.getNotificationById(id);
    res.json(new ApiResponse(200, notification, "Notification retrieved"));
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await notificationService.markAsRead(id);
    res.json(new ApiResponse(200, {}, "Notification marked as read"));
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    await notificationService.markAllAsRead(userId);
    res.json(new ApiResponse(200, {}, "All notifications marked as read"));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await notificationService.deleteNotification(id);
    res.json(new ApiResponse(200, {}, "Notification deleted"));
  });
}

export default new NotificationController();
