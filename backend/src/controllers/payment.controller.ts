/**
 * Payment Controller
 */

import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import paymentService from "../services/payment.service";
import { stripeWebhookLimiter } from "../config/rateLimit";

class PaymentController {
  createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { amount, orderId, currency = "USD" } = req.body;
    const paymentIntent = await paymentService.createPaymentIntent(userId, {
      amount,
      orderId,
      currency,
    });
    res.json(new ApiResponse(200, paymentIntent, "Payment intent created"));
  });

  getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const status = await paymentService.getPaymentStatus(orderId);
    res.json(new ApiResponse(200, status, "Payment status retrieved"));
  });

  refund = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { paymentIntentId, reason } = req.body;
    const result = await paymentService.refund(userId, paymentIntentId, reason);
    res.json(new ApiResponse(200, result, "Refund processed"));
  });

  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const result = await paymentService.handleStripeWebhook(req.body, sig);
    res.json(new ApiResponse(200, result, "Webhook processed"));
  });
}

export default new PaymentController();
