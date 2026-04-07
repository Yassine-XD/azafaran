import { Request, Response } from "express";
import { orderService } from "../services/order.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";

export const orderController = {
  placeOrder: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.placeOrder(req.user!.sub, req.body);
    return success(res, order, 201);
  }),

  getOrders: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const period = req.query.period as string | undefined;
    const result = await orderService.getOrders(req.user!.sub, page, limit, period);
    return success(res, result.orders, 200, result.meta);
  }),

  getOrderById: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getOrderById(req.user!.sub, req.params.id);
    return success(res, order);
  }),

  cancelOrder: asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.cancelOrder(req.user!.sub, req.params.id);
    return success(res, result);
  }),

  reorder: asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.reorder(req.user!.sub, req.params.id);
    return success(res, result);
  }),

  reviewOrder: asyncHandler(async (req: Request, res: Response) => {
    const result = await orderService.reviewOrder(
      req.user!.sub,
      req.params.id,
      req.body,
    );
    return success(res, result, 201);
  }),
};
