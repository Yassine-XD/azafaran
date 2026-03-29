import { Router } from "express";
import { cartController } from "../controllers/cart.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import {
  addToCartSchema,
  updateCartItemSchema,
  applyPromoSchema,
} from "../validators/cart.schema";

const router = Router();
router.use(authenticate);

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

export default router;
