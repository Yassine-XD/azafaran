import { Router } from "express";
import { surveyController } from "../controllers/survey.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import { submitResponseSchema } from "../validators/survey.schema";

const router = Router();

router.use(authenticate);

router.get("/:id", surveyController.getById);
router.get("/:id/me", surveyController.getMyStatus);
router.post(
  "/:id/responses",
  validateBody(submitResponseSchema),
  surveyController.submit,
);

export default router;
