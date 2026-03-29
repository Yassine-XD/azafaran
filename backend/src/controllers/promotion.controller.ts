import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";
import { promotionService } from "../services/promotion.service";

export const promotionController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await promotionService.getAllPromotions({ page, limit });
    return success(res, result.data, 200, result.pagination);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const promotion = await promotionService.getPromotionById(id);
    return success(res, promotion);
  }),

  validateCode: asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    const userId = req.user?.sub;
    const result = await promotionService.validatePromoCode(code, userId);
    return success(res, result);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const promotion = await promotionService.createPromotion(req.body);
    return success(res, promotion, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const promotion = await promotionService.updatePromotion(id, req.body);
    return success(res, promotion);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await promotionService.deletePromotion(id);
    return success(res, { message: "Promoción eliminada" });
  }),
};
