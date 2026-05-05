import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { adminController } from "../controllers/admin.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";
import { validateBody } from "../middleware/validate";
import { updateOrderStatusSchema } from "../validators/order.schema";
import { adminSendNotificationSchema } from "../validators/notification.schema";
import { uploadTicketFiles } from "../middleware/uploadTicketFiles";
import { sseClients } from "../utils/sseClients";
import { error } from "../utils/apiResponse";

function handleTicketUploadErrors(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return error(res, "Archivo demasiado grande (máx 8 MB)", 400, "FILE_TOO_LARGE");
    if (err.code === "LIMIT_FILE_COUNT")
      return error(res, "Máximo 5 archivos", 400, "TOO_MANY_FILES");
    return error(res, "Error al subir archivo", 400, "UPLOAD_ERROR");
  }
  if (err && err.message === "INVALID_FILE_TYPE") {
    return error(res, "Tipo de archivo no permitido", 400, "INVALID_FILE_TYPE");
  }
  return next(err);
}

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(requireAdmin);

// Real-time admin alerts (Server-Sent Events)
router.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.add(res);

  // Keep-alive heartbeat every 30 s
  const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 30_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.remove(res);
  });
});

// Dashboard
router.get("/dashboard", adminController.getDashboard);

// Products CRUD
router.get("/products", adminController.getProducts);
router.get("/products/:id", adminController.getProductDetail);
router.post("/products", adminController.createProduct);
router.put("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);
router.post("/products/:id/variants", adminController.addVariant);
router.put("/products/:id/variants/:vid", adminController.updateVariant);
router.delete("/products/:id/variants/:vid", adminController.deleteVariant);

// Pack Items
router.get("/products/:id/pack-items", adminController.getPackItems);
router.post("/products/:id/pack-items", adminController.addPackItem);
router.put("/products/:id/pack-items/:itemId", adminController.updatePackItem);
router.delete("/products/:id/pack-items/:itemId", adminController.deletePackItem);

// Orders management
router.get("/orders", adminController.getOrders);
router.get("/orders/active", adminController.getActiveOrders);
router.get("/orders/:id", adminController.getOrderDetail);
router.patch(
  "/orders/:id/status",
  validateBody(updateOrderStatusSchema),
  adminController.updateOrderStatus,
);

// Users
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserDetail);
router.patch("/users/:id", adminController.updateUser);

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
router.delete("/promo-codes/:id", adminController.deletePromoCode);

// Delivery Slots
router.get("/delivery-slots", adminController.getDeliverySlots);
router.post("/delivery-slots", adminController.createDeliverySlots);

// Notifications / Campaigns
router.get("/notifications/campaigns", adminController.getCampaigns);
router.post(
  "/notifications/send",
  validateBody(adminSendNotificationSchema),
  adminController.createCampaign,
);

// Audit Log
router.get("/audit-log", adminController.getAuditLog);

// Categories CRUD
router.get("/categories", adminController.getCategories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

// Reviews
router.get("/reviews", adminController.getReviews);

// Support Tickets
router.get("/tickets", adminController.getTickets);
router.get("/tickets/:id", adminController.getTicketDetail);
router.post(
  "/tickets/:id/messages",
  uploadTicketFiles,
  handleTicketUploadErrors,
  adminController.replyTicket,
);
router.patch("/tickets/:id", adminController.updateTicket);

export default router;
