import { Request, Response } from "express";
import { productService } from "../services/product.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";
import { listProductsSchema, updateProductSchema } from "../validators/product.schema";
import { getLang } from "../utils/i18n";

export const productController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const input = listProductsSchema.parse(req.query);
    const lang = getLang(req);
    const result = await productService.getAll(input, lang);
    return success(res, result.products, 200, result.meta);
  }),

  getFeatured: asyncHandler(async (req: Request, res: Response) => {
    const lang = getLang(req);
    const result = await productService.getFeatured(lang);
    return success(res, result);
  }),

  search: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const lang = getLang(req);
    const results = await productService.search(query, lang);
    return success(res, results);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const lang = getLang(req);
    const product = await productService.getById(req.params.id, lang);
    return success(res, product);
  }),

  getVariants: asyncHandler(async (req: Request, res: Response) => {
    const lang = getLang(req);
    const variants = await productService.getVariants(req.params.id, lang);
    return success(res, variants);
  }),

  updateProduct: asyncHandler(async (req: Request, res: Response) => {
    const input = updateProductSchema.parse(req.body);
    const lang = getLang(req);
    const product = await productService.updateProduct(req.params.id, input, lang);
    return success(res, product);
  }),
};
