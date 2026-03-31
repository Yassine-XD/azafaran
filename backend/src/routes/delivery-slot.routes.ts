import { Router } from "express";
import { deliverySlotController } from "../controllers/delivery-slot.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// Auth required — only logged-in users checking out need slots
router.get("/available", authenticate, deliverySlotController.getAvailable);

export default router;
