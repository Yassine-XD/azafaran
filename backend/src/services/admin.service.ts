import { adminRepository } from "../repositories/admin.repository";
import { orderRepository } from "../repositories/order.repository";
import { productRepository } from "../repositories/product.repository";
import { notificationService } from "./notification.service";
import { logger } from "../utils/logger";

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

// Status transitions that trigger push notifications
const STATUS_NOTIFICATION_MAP: Record<string, string> = {
  confirmed: "order_confirmed",
  preparing: "order_preparing",
  shipped: "order_shipped",
  delivered: "order_delivered",
  cancelled: "order_cancelled",
};

export const adminService = {
  // ─── Dashboard ──────────────────────────────────────

  async getDashboard() {
    return adminRepository.getDashboardStats();
  },

  // ─── Products ───────────────────────────────────────

  async getProducts(filters: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    active?: boolean;
  }) {
    const { rows, total } = await adminRepository.findAllProducts(filters);
    return {
      data: rows.map((p: any) => ({
        ...p,
        price_per_kg: parseFloat(p.price_per_kg),
      })),
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        total_pages: Math.ceil(total / filters.limit),
      },
    };
  },

  async createProduct(data: any, adminId: string) {
    const product = await adminRepository.createProduct(data);
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "product",
      entityId: product.id,
      after: product,
    });
    return product;
  },

  async updateProduct(id: string, data: any, adminId: string) {
    const before = await productRepository.findById(id);
    if (!before)
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");

    const updated = await adminRepository.updateProduct(id, data);
    if (!updated)
      throw appError("No hay campos para actualizar", 400, "NO_FIELDS");

    await adminRepository.createAuditLog({
      adminId,
      action: "update",
      entity: "product",
      entityId: id,
      before,
      after: updated,
    });
    return updated;
  },

  async deleteProduct(id: string, adminId: string) {
    const product = await adminRepository.softDeleteProduct(id);
    if (!product)
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");

    await adminRepository.createAuditLog({
      adminId,
      action: "delete",
      entity: "product",
      entityId: id,
      before: { is_active: true },
      after: { is_active: false },
    });
    return product;
  },

  async addVariant(productId: string, data: any, adminId: string) {
    const product = await productRepository.findById(productId);
    if (!product)
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");

    const variant = await adminRepository.createVariant(productId, data);
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "product_variant",
      entityId: variant.id,
      after: variant,
    });
    return variant;
  },

  async updateVariant(
    productId: string,
    variantId: string,
    data: any,
    adminId: string,
  ) {
    const variant = await productRepository.findVariantById(variantId);
    if (!variant || variant.product_id !== productId)
      throw appError("Variante no encontrada", 404, "VARIANT_NOT_FOUND");

    const updated = await adminRepository.updateVariant(variantId, data);
    await adminRepository.createAuditLog({
      adminId,
      action: "update",
      entity: "product_variant",
      entityId: variantId,
      before: variant,
      after: updated,
    });
    return updated;
  },

  // ─── Orders ─────────────────────────────────────────

  async getOrders(filters: {
    page: number;
    limit: number;
    status?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const { rows, total } = await adminRepository.findAllOrders(filters);
    return {
      data: rows.map((o: any) => ({
        ...o,
        subtotal: parseFloat(o.subtotal),
        delivery_fee: parseFloat(o.delivery_fee),
        discount_amount: parseFloat(o.discount_amount),
        total: parseFloat(o.total),
      })),
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        total_pages: Math.ceil(total / filters.limit),
      },
    };
  },

  async updateOrderStatus(
    orderId: string,
    status: string,
    adminId: string,
  ) {
    const order = await orderRepository.findById(orderId);
    if (!order)
      throw appError("Pedido no encontrado", 404, "ORDER_NOT_FOUND");

    const updated = await orderRepository.updateStatus(orderId, status);

    await adminRepository.createAuditLog({
      adminId,
      action: "update_status",
      entity: "order",
      entityId: orderId,
      before: { status: order.status },
      after: { status },
    });

    // Send push notification for status change
    const eventType = STATUS_NOTIFICATION_MAP[status];
    if (eventType) {
      await notificationService
        .sendOrderNotification(order.user_id, eventType, orderId)
        .catch((err) =>
          logger.error(`Failed to send order notification: ${err.message}`),
        );
    }

    return updated;
  },

  // ─── Users ──────────────────────────────────────────

  async getUsers(filters: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const { rows, total } = await adminRepository.findAllUsers(filters);
    return {
      data: rows,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        total_pages: Math.ceil(total / filters.limit),
      },
    };
  },

  async getUserDetail(userId: string) {
    const user = await adminRepository.findUserById(userId);
    if (!user)
      throw appError("Usuario no encontrado", 404, "USER_NOT_FOUND");

    const { rows: orders } = await orderRepository.findByUserId(userId, 1, 10);
    return { ...user, recent_orders: orders };
  },

  // ─── Promotions ─────────────────────────────────────

  async getPromotions(page: number, limit: number) {
    const { rows, total } = await adminRepository.findAllPromotions(page, limit);
    return {
      data: rows,
      meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  },

  async createPromotion(data: any, adminId: string) {
    const promo = await adminRepository.createPromotion({
      ...data,
      created_by: adminId,
    });
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "promotion",
      entityId: promo.id,
      after: promo,
    });
    return promo;
  },

  async updatePromotion(id: string, data: any, adminId: string) {
    const updated = await adminRepository.updatePromotion(id, data);
    if (!updated)
      throw appError("Promoción no encontrada", 404, "PROMOTION_NOT_FOUND");
    await adminRepository.createAuditLog({
      adminId,
      action: "update",
      entity: "promotion",
      entityId: id,
      after: updated,
    });
    return updated;
  },

  async deletePromotion(id: string, adminId: string) {
    const deleted = await adminRepository.deletePromotion(id);
    if (!deleted)
      throw appError("Promoción no encontrada", 404, "PROMOTION_NOT_FOUND");
    await adminRepository.createAuditLog({
      adminId,
      action: "delete",
      entity: "promotion",
      entityId: id,
    });
    return deleted;
  },

  // ─── Banners ────────────────────────────────────────

  async getBanners(page: number, limit: number) {
    const { rows, total } = await adminRepository.findAllBanners(page, limit);
    return {
      data: rows,
      meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  },

  async createBanner(data: any, adminId: string) {
    const banner = await adminRepository.createBanner(data);
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "banner",
      entityId: banner.id,
      after: banner,
    });
    return banner;
  },

  async updateBanner(id: string, data: any, adminId: string) {
    const updated = await adminRepository.updateBanner(id, data);
    if (!updated)
      throw appError("Banner no encontrado", 404, "BANNER_NOT_FOUND");
    await adminRepository.createAuditLog({
      adminId,
      action: "update",
      entity: "banner",
      entityId: id,
      after: updated,
    });
    return updated;
  },

  async deleteBanner(id: string, adminId: string) {
    const deleted = await adminRepository.deleteBanner(id);
    if (!deleted)
      throw appError("Banner no encontrado", 404, "BANNER_NOT_FOUND");
    await adminRepository.createAuditLog({
      adminId,
      action: "delete",
      entity: "banner",
      entityId: id,
    });
    return deleted;
  },

  // ─── Promo Codes ────────────────────────────────────

  async getPromoCodes(page: number, limit: number) {
    const { rows, total } = await adminRepository.findAllPromoCodes(
      page,
      limit,
    );
    return {
      data: rows.map((c: any) => ({
        ...c,
        value: parseFloat(c.value),
        min_order_amount: parseFloat(c.min_order_amount),
      })),
      meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  },

  async createPromoCode(data: any, adminId: string) {
    const code = await adminRepository.createPromoCode(data);
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "promo_code",
      entityId: code.id,
      after: code,
    });
    return code;
  },

  async updatePromoCode(id: string, data: any, adminId: string) {
    const updated = await adminRepository.updatePromoCode(id, data);
    if (!updated)
      throw appError("Código no encontrado", 404, "PROMO_CODE_NOT_FOUND");
    await adminRepository.createAuditLog({
      adminId,
      action: "update",
      entity: "promo_code",
      entityId: id,
      after: updated,
    });
    return updated;
  },

  // ─── Delivery Slots ─────────────────────────────────

  async getDeliverySlots(page: number, limit: number) {
    const { rows, total } = await adminRepository.findAllDeliverySlots(
      page,
      limit,
    );
    return {
      data: rows,
      meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  },

  async bulkCreateSlots(
    slots: Array<{
      date: string;
      start_time: string;
      end_time: string;
      max_orders?: number;
    }>,
    adminId: string,
  ) {
    const created = await adminRepository.bulkCreateDeliverySlots(slots);
    await adminRepository.createAuditLog({
      adminId,
      action: "bulk_create",
      entity: "delivery_slot",
      after: { count: created.length },
    });
    return created;
  },

  // ─── Audit & Reviews ───────────────────────────────

  async getAuditLogs(filters: {
    page: number;
    limit: number;
    adminId?: string;
    action?: string;
    entity?: string;
  }) {
    const { rows, total } = await adminRepository.findAuditLogs(filters);
    return {
      data: rows,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        total_pages: Math.ceil(total / filters.limit),
      },
    };
  },

  async getReviews(page: number, limit: number) {
    const { rows, total } = await adminRepository.findAllReviews(page, limit);
    return {
      data: rows,
      meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  },

  // ─── Notification Campaigns ─────────────────────────

  async getCampaigns(page: number, limit: number) {
    const { rows, total } = await adminRepository.findAllCampaigns(page, limit);
    return {
      data: rows,
      meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  },

  async createCampaign(data: any, adminId: string) {
    const campaign = await adminRepository.createCampaign({
      ...data,
      createdBy: adminId,
    });
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "notification_campaign",
      entityId: campaign.id,
      after: campaign,
    });
    return campaign;
  },
};
