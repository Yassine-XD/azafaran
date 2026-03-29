import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

router.get("/dashboard", adminController.getDashboard);
router.get("/users", adminController.getUsers);
router.get("/orders", adminController.getOrders);
router.post("/orders/:orderId/status", adminController.updateOrderStatus);
router.get("/analytics", adminController.getAnalytics);
router.get("/reports", adminController.getReports);
router.post("/broadcasts", adminController.sendBroadcast);

export default router;
