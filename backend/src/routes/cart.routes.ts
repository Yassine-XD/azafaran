import { Router } from "express";
import { cartController } from "../controllers/cart.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody, validateParams } from "../middleware/validate";
import {
  addToCartSchema,
  updateCartItemSchema,
  applyPromoSchema,
  cartItemIdSchema,
} from "../validators/cart.schema";

const router = Router();
router.use(authenticate);

router.get("/", validateBody(applyPromoSchema), cartController.getCart);
router.get("/", cartController.getCart);
router.post("/items", validateBody(addToCartSchema), cartController.addItem);
router.put(
  "/items/:itemId",
  validateBody(updateCartItemSchema),
  cartController.updateItem,
);
router.delete("/items/:itemId", cartController.removeItem);
router.delete("/", cartController.clearCart);
router.post("/validate", cartController.validateCart);
router.post(
  "/apply-promo",
  validateBody(applyPromoSchema),
  cartController.applyPromo,
);
router.delete("/promo", cartController.clearCart);

export default router;
