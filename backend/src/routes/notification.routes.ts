import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// All notification operations require authentication
router.use(authenticate);

router.get("/", notificationController.getAll);
router.put("/:id/read", notificationController.markAsRead);
router.put("/mark-all-read", notificationController.markAllAsRead);

export default router;
