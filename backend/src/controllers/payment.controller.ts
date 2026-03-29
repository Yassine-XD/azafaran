import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";
import { paymentService } from "../services/payment.service";

export const paymentController = {
  createPaymentIntent: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { amount, orderId, currency } = req.body;
    const result = await paymentService.createPaymentIntent(userId, {
      amount,
      orderId,
      currency,
    });
    return success(res, result);
  }),

  getPaymentStatus: asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const status = await paymentService.getPaymentStatus(orderId);
    return success(res, status);
  }),

  refund: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { paymentIntentId, reason } = req.body;
    const result = await paymentService.refund(userId, paymentIntentId, reason);
    return success(res, result);
  }),

  handleWebhook: asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const result = await paymentService.handleStripeWebhook(req.body, sig);
    return success(res, result);
  }),
};
