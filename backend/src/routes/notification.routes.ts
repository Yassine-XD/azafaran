import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/authenticate";
import { validateBody } from "../middleware/validate";
import {
  registerTokenSchema,
  unregisterTokenSchema,
  updatePreferencesSchema,
} from "../validators/notification.schema";

const router = Router();
router.use(authenticate);

// Push token management
router.post(
  "/token",
  validateBody(registerTokenSchema),
  notificationController.registerToken,
);
router.delete(
  "/token",
  validateBody(unregisterTokenSchema),
  notificationController.unregisterToken,
);

// Notification preferences
router.get("/preferences", notificationController.getPreferences);
router.put(
  "/preferences",
  validateBody(updatePreferencesSchema),
  notificationController.updatePreferences,
);

// Notification history
router.get("/", notificationController.getNotifications);

// Track opened
router.post("/opened/:logId", notificationController.markOpened);

export default router;
