import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";

export const paymentController = {
  createIntent: asyncHandler(async (req: Request, res: Response) => {
    const { orderId, amount, currency } = req.body;
    const result = await paymentService.createPaymentIntent(
      req.user!.sub,
      orderId,
      amount,
      currency,
    );
    return success(res, result);
  }),

  getStatus: asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentService.getPaymentStatus(
      req.params.orderId,
      req.user!.sub,
    );
    return success(res, result);
  }),

  handleWebhook: asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    // req.body is raw Buffer thanks to express.raw() middleware on this route
    const result = await paymentService.handleWebhook(req.body, sig);
    return success(res, result);
  }),
};
