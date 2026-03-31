import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";

export const notificationController = {
  registerToken: asyncHandler(async (req: Request, res: Response) => {
    const { token, platform } = req.body;
    const result = await notificationService.registerToken(
      req.user!.sub,
      token,
      platform,
    );
    return success(res, result, 201);
  }),

  unregisterToken: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    await notificationService.unregisterToken(req.user!.sub, token);
    return success(res, { message: "Token eliminado" });
  }),

  getPreferences: asyncHandler(async (req: Request, res: Response) => {
    const prefs = await notificationService.getPreferences(req.user!.sub);
    return success(res, prefs);
  }),

  updatePreferences: asyncHandler(async (req: Request, res: Response) => {
    const prefs = await notificationService.updatePreferences(
      req.user!.sub,
      req.body,
    );
    return success(res, prefs);
  }),

  getNotifications: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await notificationService.getNotifications(
      req.user!.sub,
      page,
      limit,
    );
    return success(res, result.notifications, 200, result.meta);
  }),

  markOpened: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markOpened(req.params.logId);
    return success(res, { message: "Notificación marcada como abierta" });
  }),
};
