/**
 * Promotion Controller
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import promotionService from "../services/promotion.service";

class PromotionController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const result = await promotionService.getAllPromotions({
      page: Number(page),
      limit: Number(limit),
    });
    res.json(new ApiResponse(200, result, "Promotions retrieved"));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const promotion = await promotionService.getPromotionById(id);
    res.json(new ApiResponse(200, promotion, "Promotion retrieved"));
  });

  validateCode = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    const userId = (req as any).user?.id;
    const result = await promotionService.validatePromoCode(code, userId);
    res.json(new ApiResponse(200, result, "Promo code validated"));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const promotion = await promotionService.createPromotion(req.body);
    res.status(201).json(new ApiResponse(201, promotion, "Promotion created"));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const promotion = await promotionService.updatePromotion(id, req.body);
    res.json(new ApiResponse(200, promotion, "Promotion updated"));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await promotionService.deletePromotion(id);
    res.json(new ApiResponse(200, {}, "Promotion deleted"));
  });
}

export default new PromotionController();
