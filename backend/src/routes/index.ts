import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import userRoutes from "./user.routes";
import promotionRoutes from "./promotion.routes";
import deliverySlotRoutes from "./delivery-slot.routes";
import notificationRoutes from "./notification.routes";
import paymentRoutes from "./payment.routes";
import adminRoutes from "./admin.routes";

const router = Router();

// Health check — always first
router.get("/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
  });
});

// Mount routes
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/users", userRoutes);
router.use("/promotions", promotionRoutes);
router.use("/delivery-slots", deliverySlotRoutes);
router.use("/notifications", notificationRoutes);
router.use("/payments", paymentRoutes);
router.use("/admin", adminRoutes);

export default router;
