import { Router } from "express";
import { promotionController } from "../controllers/promotion.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import { z } from "zod";

const validateCodeSchema = z.object({
  code: z.string().min(1).max(50),
});

const router = Router();

// Public endpoints
router.get("/active", promotionController.getActive);
router.get("/banners", promotionController.getBanners);

// Validate promo — optionally authed (userId checked if logged in)
router.post(
  "/validate-code",
  authenticate,
  validateBody(validateCodeSchema),
  promotionController.validateCode,
);

export default router;
