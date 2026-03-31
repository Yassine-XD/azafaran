import { Request, Response } from "express";
import { deliverySlotRepository } from "../repositories/deliverySlot.repository";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";

export const deliverySlotController = {
  getAvailable: asyncHandler(async (req: Request, res: Response) => {
    const slots = await deliverySlotRepository.findAvailable();
    return success(res, slots);
  }),
};
