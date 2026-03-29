import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";
import { adminService } from "../services/admin.service";

export const adminController = {
  getDashboard: asyncHandler(async (req: Request, res: Response) => {
    const dashboard = await adminService.getDashboard();
    return success(res, dashboard);
  }),

  getUsers: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const result = await adminService.getAllUsers({ page, limit, search });
    return success(res, result.data, 200, result.pagination);
  }),

  getOrders: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const userId = req.query.userId as string | undefined;
    const result = await adminService.getAllOrders({ page, limit, status, userId });
    return success(res, result.data, 200, result.pagination);
  }),

  updateOrderStatus: asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await adminService.updateOrderStatus(orderId, status);
    return success(res, order);
  }),

  getAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const analytics = await adminService.getAnalytics(startDate, endDate);
    return success(res, analytics);
  }),

  getReports: asyncHandler(async (req: Request, res: Response) => {
    const type = (req.query.type as string) || "sales";
    const reports = await adminService.getReports(type);
    return success(res, reports);
  }),

  sendBroadcast: asyncHandler(async (req: Request, res: Response) => {
    const { message, title, targetUsers } = req.body;
    await adminService.sendBroadcastNotification(message, title, targetUsers);
    return success(res, { message: "Notificación enviada" });
  }),
};
