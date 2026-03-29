import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validators/auth.schema";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    error: {
      message: "Demasiados intentos. Espera un minuto.",
      code: "RATE_LIMITED",
    },
  },
});

const router = Router();

router.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  authController.register,
);
router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  authController.login,
);
router.post(
  "/refresh",
  authLimiter,
  validateBody(refreshSchema),
  authController.refresh,
);
router.post("/logout", authenticate, authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);

export default router;
