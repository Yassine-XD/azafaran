import { Router } from "express";
import express from "express";
import { paymentController } from "../controllers/payment.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import { createIntentSchema } from "../validators/payment.schema";
import { stripeWebhookLimiter } from "../config/rateLimit";

const router = Router();

// Stripe webhook — needs raw body for signature verification
// Must be BEFORE any json body parser
router.post(
  "/webhook",
  stripeWebhookLimiter,
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook,
);

// Authenticated payment endpoints
router.use(authenticate);

router.post(
  "/intent",
  validateBody(createIntentSchema),
  paymentController.createIntent,
);
router.get("/order/:orderId", paymentController.getStatus);

export default router;
