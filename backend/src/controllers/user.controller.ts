import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";

export const userController = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getProfile(req.user!.sub);
    return success(res, user);
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateProfile(req.user!.sub, req.body);
    return success(res, user);
  }),

  deleteAccount: asyncHandler(async (req: Request, res: Response) => {
    await userService.deleteAccount(req.user!.sub);
    return success(res, { message: "Cuenta eliminada correctamente" });
  }),

  // ─── Addresses ──────────────────────────────────────

  getAddresses: asyncHandler(async (req: Request, res: Response) => {
    const addresses = await userService.getAddresses(req.user!.sub);
    return success(res, addresses);
  }),

  addAddress: asyncHandler(async (req: Request, res: Response) => {
    const address = await userService.addAddress(req.user!.sub, req.body);
    return success(res, address, 201);
  }),

  updateAddress: asyncHandler(async (req: Request, res: Response) => {
    const address = await userService.updateAddress(
      req.user!.sub,
      req.params.id,
      req.body,
    );
    return success(res, address);
  }),

  setDefaultAddress: asyncHandler(async (req: Request, res: Response) => {
    await userService.setDefaultAddress(req.user!.sub, req.params.id);
    return success(res, { message: "Dirección predeterminada actualizada" });
  }),

  deleteAddress: asyncHandler(async (req: Request, res: Response) => {
    await userService.deleteAddress(req.user!.sub, req.params.id);
    return success(res, { message: "Dirección eliminada correctamente" });
  }),
};
