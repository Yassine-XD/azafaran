import { Router } from "express";
import { promotionController } from "../controllers/promotion.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";
import { validateBody } from "../middleware/validate";
import {
  createPromotionSchema,
  updatePromotionSchema,
} from "../validators/promotion.schema";

const router = Router();

// Public
router.get("/", promotionController.getAll);
router.get("/:id", promotionController.getById);
router.get("/validate/:code", promotionController.validateCode);

// Admin operations
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateBody(createPromotionSchema),
  promotionController.create,
);
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validateBody(updatePromotionSchema),
  promotionController.update,
);
router.delete("/:id", authenticate, requireAdmin, promotionController.delete);

export default router;
