import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody, validateParams } from "../middleware/validate";
import {
  placeOrderSchema,
  reviewOrderSchema,
  orderIdSchema,
} from "../validators/order.schema";

const router = Router();
router.use(authenticate);

router.post("/", validateBody(placeOrderSchema), orderController.placeOrder);
router.get("/", orderController.getOrders);
router.get("/:id", validateParams(orderIdSchema), orderController.getOrderById);
router.post(
  "/:id/cancel",
  validateParams(orderIdSchema),
  orderController.cancelOrder,
);
router.post(
  "/:id/reorder",
  validateParams(orderIdSchema),
  orderController.reorder,
);
router.post(
  "/:id/review",
  validateParams(orderIdSchema),
  validateBody(reviewOrderSchema),
  orderController.reviewOrder,
);

export default router;
