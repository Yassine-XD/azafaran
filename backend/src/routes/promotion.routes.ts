/**
 * Promotion Routes
 */

import { Router } from "express";
import promotionController from "../controllers/promotion.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { promotionSchema } from "../validators/promotion.schema";

const router = Router();

router.get("/", promotionController.getAll);
router.get("/:id", promotionController.getById);
router.get("/validate/:code", promotionController.validateCode);

// Admin operations require authentication and admin role
router.post(
  "/",
  authenticate,
  validate(promotionSchema.create),
  promotionController.create,
);
router.put(
  "/:id",
  authenticate,
  validate(promotionSchema.update),
  promotionController.update,
);
router.delete("/:id", authenticate, promotionController.delete);

export default router;
