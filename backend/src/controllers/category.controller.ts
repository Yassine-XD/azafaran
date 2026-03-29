import { Request, Response } from "express";
import { categoryService } from "../services/category.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";

export const categoryController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const categories = await categoryService.getAll();
    return success(res, categories);
  }),

  getProductsByCategory: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await categoryService.getProductsByCategory(
      slug,
      page,
      limit,
    );
    return success(res, result.products, 200, result.meta);
  }),
};
