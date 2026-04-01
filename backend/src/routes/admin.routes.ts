import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";
import { validateBody } from "../middleware/validate";
import { updateOrderStatusSchema } from "../validators/order.schema";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get("/dashboard", adminController.getDashboard);

// Products CRUD
router.get("/products", adminController.getProducts);
router.post("/products", adminController.createProduct);
router.put("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);
router.post("/products/:id/variants", adminController.addVariant);
router.put("/products/:id/variants/:vid", adminController.updateVariant);

// Orders management
router.get("/orders", adminController.getOrders);
router.patch(
  "/orders/:id/status",
  validateBody(updateOrderStatusSchema),
  adminController.updateOrderStatus,
);

// Users
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserDetail);

// Promotions
router.get("/promotions", adminController.getPromotions);
router.post("/promotions", adminController.createPromotion);
router.put("/promotions/:id", adminController.updatePromotion);
router.delete("/promotions/:id", adminController.deletePromotion);

// Banners
router.get("/banners", adminController.getBanners);
router.post("/banners", adminController.createBanner);
router.put("/banners/:id", adminController.updateBanner);
router.delete("/banners/:id", adminController.deleteBanner);

// Promo Codes
router.get("/promo-codes", adminController.getPromoCodes);
router.post("/promo-codes", adminController.createPromoCode);
router.put("/promo-codes/:id", adminController.updatePromoCode);

// Delivery Slots
router.get("/delivery-slots", adminController.getDeliverySlots);
router.post("/delivery-slots", adminController.createDeliverySlots);

// Notifications / Campaigns
router.get("/notifications/campaigns", adminController.getCampaigns);
router.post("/notifications/send", adminController.createCampaign);

// Audit Log
router.get("/audit-log", adminController.getAuditLog);

// Categories CRUD
router.get("/categories", adminController.getCategories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

// Reviews
router.get("/reviews", adminController.getReviews);

export default router;
