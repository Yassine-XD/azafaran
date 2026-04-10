import { Router } from "express";
import rateLimit from "express-rate-limit";
import { errorReportController } from "../controllers/error-report.controller";
import { validateBody } from "../middleware/validate";
import { errorReportSchema } from "../validators/error-report.schema";

const router = Router();

// Strict rate limit: 5 error reports per hour per IP
const errorReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: { message: "Too many error reports", code: "RATE_LIMITED" },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/",
  errorReportLimiter,
  validateBody(errorReportSchema),
  errorReportController.report,
);

export default router;
