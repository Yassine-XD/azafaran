import { Request, Response } from "express";
import { productService } from "../services/product.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";
import { listProductsSchema } from "../validators/product.schema";

export const productController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const input = listProductsSchema.parse(req.query);
    const result = await productService.getAll(input);
    return success(res, result.products, 200, result.meta);
  }),

  getFeatured: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.getFeatured();
    return success(res, result);
  }),

  search: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const results = await productService.search(query);
    return success(res, results);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getById(req.params.id);
    return success(res, product);
  }),

  getVariants: asyncHandler(async (req: Request, res: Response) => {
    const variants = await productService.getVariants(req.params.id);
    return success(res, variants);
  }),
};
