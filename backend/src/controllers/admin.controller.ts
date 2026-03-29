/**
 * Admin Controller
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import adminService from "../services/admin.service";

class AdminController {
  getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const dashboard = await adminService.getDashboard();
    res.json(new ApiResponse(200, dashboard, "Dashboard data retrieved"));
  });

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, search } = req.query;
    const result = await adminService.getAllUsers({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
    });
    res.json(new ApiResponse(200, result, "Users retrieved"));
  });

  getOrders = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, status, userId } = req.query;
    const result = await adminService.getAllOrders({
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      userId: userId as string,
    });
    res.json(new ApiResponse(200, result, "Orders retrieved"));
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await adminService.updateOrderStatus(orderId, status);
    res.json(new ApiResponse(200, order, "Order status updated"));
  });

  getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const analytics = await adminService.getAnalytics(
      startDate as string,
      endDate as string,
    );
    res.json(new ApiResponse(200, analytics, "Analytics retrieved"));
  });

  getReports = asyncHandler(async (req: Request, res: Response) => {
    const { type = "sales" } = req.query;
    const reports = await adminService.getReports(type as string);
    res.json(new ApiResponse(200, reports, "Reports retrieved"));
  });

  sendBroadcast = asyncHandler(async (req: Request, res: Response) => {
    const { message, title, targetUsers } = req.body;
    await adminService.sendBroadcastNotification(message, title, targetUsers);
    res.json(new ApiResponse(200, {}, "Broadcast sent"));
  });
}

export default new AdminController();
