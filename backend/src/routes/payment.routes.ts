/**
 * Payment Routes
 */

import { Router } from "express";
import paymentController from "../controllers/payment.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { stripeWebhookLimiter } from "../config/rateLimit";

const router = Router();

// Webhook endpoint does not require authentication (uses signature verification)
router.post("/webhook", stripeWebhookLimiter, paymentController.handleWebhook);

// All other payment operations require authentication
router.use(authenticate);

router.post("/create-payment-intent", paymentController.createPaymentIntent);
router.get("/order/:orderId", paymentController.getPaymentStatus);
router.post("/refund", paymentController.refund);

export default router;
