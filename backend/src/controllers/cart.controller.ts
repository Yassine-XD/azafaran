import { Request, Response } from "express";
import { cartService } from "../services/cart.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";
import { getLang } from "../utils/i18n";

export const cartController = {
  getCart: asyncHandler(async (req: Request, res: Response) => {
    const lang = getLang(req);
    const cart = await cartService.getCart(req.user!.sub, lang);
    return success(res, cart);
  }),

  addItem: asyncHandler(async (req: Request, res: Response) => {
    const lang = getLang(req);
    const cart = await cartService.addItem(req.user!.sub, req.body, lang);
    return success(res, cart);
  }),

  updateItem: asyncHandler(async (req: Request, res: Response) => {
    const lang = getLang(req);
    const cart = await cartService.updateItem(
      req.user!.sub,
      req.params.itemId,
      req.body,
      lang,
    );
    return success(res, cart);
  }),

  removeItem: asyncHandler(async (req: Request, res: Response) => {
    const lang = getLang(req);
    const cart = await cartService.removeItem(req.user!.sub, req.params.itemId, lang);
    return success(res, cart);
  }),

  clearCart: asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.clearCart(req.user!.sub);
    return success(res, result);
  }),

  validateCart: asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.validateCart(req.user!.sub);
    return success(res, result);
  }),

  applyPromo: asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.applyPromo(req.user!.sub, req.body);
    return success(res, result);
  }),
};
