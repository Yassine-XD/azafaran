import { Request, Response } from "express";
import { promotionService } from "../services/promotion.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";

export const promotionController = {
  getActive: asyncHandler(async (req: Request, res: Response) => {
    const promotions = await promotionService.getActivePromotions();
    return success(res, promotions);
  }),

  getBanners: asyncHandler(async (req: Request, res: Response) => {
    const banners = await promotionService.getBanners();
    return success(res, banners);
  }),

  validateCode: asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;
    const userId = req.user?.sub;
    const result = await promotionService.validatePromoCode(code, userId);
    return success(res, result);
  }),
};
