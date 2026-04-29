import { pool } from "../config/database";
import { adminRepository } from "../repositories/admin.repository";
import { orderRepository } from "../repositories/order.repository";
import { productRepository } from "../repositories/product.repository";
import { notificationService } from "./notification.service";
import { emailService } from "./email.service";
import { logger } from "../utils/logger";
import {
  AdminSendNotificationInput,
  ALLOWED_NOTIFICATION_SCREENS,
} from "../validators/notification.schema";

type AuditCtx = { ipAddress?: string; userAgent?: string };

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

  async getProductDetail(id: string) {
    const product = await adminRepository.findProductById(id);
    if (!product)
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");
    return product;
  },

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

  async createProduct(data: any, adminId: string, ctx?: AuditCtx) {
    const product = await adminRepository.createProduct(data);
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "product",
      entityId: product.id,
      after: product,
      ...ctx,
    });
    return product;
  },

  async updateProduct(id: string, data: any, adminId: string, ctx?: AuditCtx) {
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
      ...ctx,
    });
    return updated;
  },

  async deleteProduct(id: string, adminId: string, ctx?: AuditCtx) {
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
      ...ctx,
    });
    return product;
  },

  async addVariant(productId: string, data: any, adminId: string, ctx?: AuditCtx) {
    const product = await adminRepository.findProductById(productId);
    if (!product)
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");

    const variant = await adminRepository.createVariant(productId, data);
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "product_variant",
      entityId: variant.id,
      after: variant,
      ...ctx,
    });
    return variant;
  },

  async updateVariant(
    productId: string,
    variantId: string,
    data: any,
    adminId: string,
    ctx?: AuditCtx,
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
      ...ctx,
    });
    return updated;
  },

  async deleteVariant(productId: string, variantId: string, adminId: string, ctx?: AuditCtx) {
    const variant = await productRepository.findVariantById(variantId);
    if (!variant || variant.product_id !== productId)
      throw appError("Variante no encontrada", 404, "VARIANT_NOT_FOUND");

    await adminRepository.deleteVariant(variantId);
    await adminRepository.createAuditLog({
      adminId,
      action: "delete",
      entity: "product_variant",
      entityId: variantId,
      before: variant,
      ...ctx,
    });
  },

  // ─── Pack Items ─────────────────────────────────────

  async getPackItems(packId: string) {
    const product = await productRepository.findById(packId);
    if (!product)
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");
    return adminRepository.findPackItems(packId);
  },

  async addPackItem(packId: string, data: any, adminId: string, ctx?: AuditCtx) {
    const pack = await adminRepository.findProductById(packId);
    if (!pack)
      throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");
    if (pack.unit_type !== "pack")
      throw appError("El producto no es un pack", 400, "NOT_A_PACK");

    const item = await adminRepository.addPackItem(packId, data);
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "pack_item",
      entityId: item.id,
      after: item,
      ...ctx,
    });
    return item;
  },

  async updatePackItem(packId: string, itemId: string, data: any, adminId: string, ctx?: AuditCtx) {
    const item = await adminRepository.findPackItemById(itemId);
    if (!item || item.pack_id !== packId)
      throw appError("Elemento no encontrado", 404, "PACK_ITEM_NOT_FOUND");

    const updated = await adminRepository.updatePackItem(itemId, data);
    await adminRepository.createAuditLog({
      adminId,
      action: "update",
      entity: "pack_item",
      entityId: itemId,
      before: item,
      after: updated,
      ...ctx,
    });
    return updated;
  },

  async deletePackItem(packId: string, itemId: string, adminId: string, ctx?: AuditCtx) {
    const item = await adminRepository.findPackItemById(itemId);
    if (!item || item.pack_id !== packId)
      throw appError("Elemento no encontrado", 404, "PACK_ITEM_NOT_FOUND");

    await adminRepository.deletePackItem(itemId);
    await adminRepository.createAuditLog({
      adminId,
      action: "delete",
      entity: "pack_item",
      entityId: itemId,
      before: item,
      ...ctx,
    });
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

  async getOrderDetail(orderId: string) {
    const order = await adminRepository.findOrderById(orderId);
    if (!order) throw appError("Pedido no encontrado", 404, "ORDER_NOT_FOUND");
    return {
      ...order,
      subtotal: parseFloat(order.subtotal),
      delivery_fee: parseFloat(order.delivery_fee),
      discount_amount: parseFloat(order.discount_amount),
      total: parseFloat(order.total),
      items: (order.items || []).map((item: any) => ({
        ...item,
        unit_price: parseFloat(item.unit_price),
        line_total: parseFloat(item.line_total),
      })),
    };
  },

  async updateOrderStatus(
    orderId: string,
    status: string,
    adminId: string,
    ctx?: AuditCtx,
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
      ...ctx,
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

    // Send status change email (fire-and-forget)
    emailService
      .sendOrderStatusUpdate(orderId, status)
      .catch((err) =>
        logger.error(`Failed to send status email: ${err.message}`),
      );

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

  async updateUser(userId: string, data: any, adminId: string, ctx?: AuditCtx) {
    // Only allow specific fields
    const allowed: Record<string, any> = {};
    if (data.role !== undefined) allowed.role = data.role;
    if (data.is_active !== undefined) allowed.is_active = data.is_active;
    if (data.is_verified !== undefined) allowed.is_verified = data.is_verified;

    if (Object.keys(allowed).length === 0)
      throw appError("No hay campos válidos para actualizar", 400, "NO_VALID_FIELDS");

    const before = await adminRepository.findUserById(userId);
    if (!before)
      throw appError("Usuario no encontrado", 404, "USER_NOT_FOUND");

    const updated = await adminRepository.updateUser(userId, allowed);
    await adminRepository.createAuditLog({
      adminId,
      action: "update",
      entity: "user",
      entityId: userId,
      before,
      after: updated,
      ...ctx,
    });
    return updated;
  },

  // ─── Promotions ─────────────────────────────────────

  async getPromotions(page: number, limit: number) {
    const { rows, total } = await adminRepository.findAllPromotions(page, limit);
    return {
      data: rows,
      meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  },

  async createPromotion(data: any, adminId: string, ctx?: AuditCtx) {
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
      ...ctx,
    });
    return promo;
  },

  async updatePromotion(id: string, data: any, adminId: string, ctx?: AuditCtx) {
    const updated = await adminRepository.updatePromotion(id, data);
    if (!updated)
      throw appError("Promoción no encontrada", 404, "PROMOTION_NOT_FOUND");
    await adminRepository.createAuditLog({
      adminId,
      action: "update",
      entity: "promotion",
      entityId: id,
      after: updated,
      ...ctx,
    });
    return updated;
  },

  async deletePromotion(id: string, adminId: string, ctx?: AuditCtx) {
    const deleted = await adminRepository.deletePromotion(id);
    if (!deleted)
      throw appError("Promoción no encontrada", 404, "PROMOTION_NOT_FOUND");
    await adminRepository.createAuditLog({
      adminId,
      action: "delete",
      entity: "promotion",
      entityId: id,
      ...ctx,
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

  async createBanner(data: any, adminId: string, ctx?: AuditCtx) {
    const banner = await adminRepository.createBanner(data);
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "banner",
      entityId: banner.id,
      after: banner,
      ...ctx,
    });
    return banner;
  },

  async updateBanner(id: string, data: any, adminId: string, ctx?: AuditCtx) {
    const updated = await adminRepository.updateBanner(id, data);
    if (!updated)
      throw appError("Banner no encontrado", 404, "BANNER_NOT_FOUND");
    await adminRepository.createAuditLog({
      adminId,
      action: "update",
      entity: "banner",
      entityId: id,
      after: updated,
      ...ctx,
    });
    return updated;
  },

  async deleteBanner(id: string, adminId: string, ctx?: AuditCtx) {
    const deleted = await adminRepository.deleteBanner(id);
    if (!deleted)
      throw appError("Banner no encontrado", 404, "BANNER_NOT_FOUND");
    await adminRepository.createAuditLog({
      adminId,
      action: "delete",
      entity: "banner",
      entityId: id,
      ...ctx,
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

  async createPromoCode(data: any, adminId: string, ctx?: AuditCtx) {
    const code = await adminRepository.createPromoCode(data);
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "promo_code",
      entityId: code.id,
      after: code,
      ...ctx,
    });
    return code;
  },

  async updatePromoCode(id: string, data: any, adminId: string, ctx?: AuditCtx) {
    const updated = await adminRepository.updatePromoCode(id, data);
    if (!updated)
      throw appError("Código no encontrado", 404, "PROMO_CODE_NOT_FOUND");
    await adminRepository.createAuditLog({
      adminId,
      action: "update",
      entity: "promo_code",
      entityId: id,
      after: updated,
      ...ctx,
    });
    return updated;
  },

  async deletePromoCode(id: string, adminId: string, ctx?: AuditCtx) {
    const deleted = await adminRepository.deletePromoCode(id);
    if (!deleted)
      throw appError("Código no encontrado", 404, "PROMO_CODE_NOT_FOUND");
    await adminRepository.createAuditLog({
      adminId,
      action: "delete",
      entity: "promo_code",
      entityId: id,
      ...ctx,
    });
    return deleted;
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
    ctx?: AuditCtx,
  ) {
    const created = await adminRepository.bulkCreateDeliverySlots(slots);
    await adminRepository.createAuditLog({
      adminId,
      action: "bulk_create",
      entity: "delivery_slot",
      after: { count: created.length },
      ...ctx,
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

  async createCampaign(
    data: AdminSendNotificationInput,
    adminId: string,
    ctx?: AuditCtx,
  ) {
    // Validate destination targets exist before persisting / sending.
    const payload = data.payload;
    if (payload.type === "product") {
      const product = await productRepository.findById(payload.productId);
      if (!product) {
        throw appError("Producto no encontrado", 404, "PRODUCT_NOT_FOUND");
      }
    } else if (payload.type === "coupon") {
      const { rows } = await pool.query(
        "SELECT id, is_active FROM promo_codes WHERE code = $1 LIMIT 1",
        [payload.promoCode],
      );
      if (rows.length === 0 || !rows[0].is_active) {
        throw appError("Código promocional inválido", 400, "INVALID_PROMO_CODE");
      }
    } else if (payload.type === "screen") {
      if (!ALLOWED_NOTIFICATION_SCREENS.includes(payload.screen as any)) {
        throw appError("Pantalla destino no permitida", 400, "INVALID_SCREEN");
      }
    }

    // If scheduled in the future, persist as draft and let the scheduler fire it.
    // Empty/missing scheduled_at means "fire immediately" — but the column is
    // NOT NULL, so we stamp NOW() and let the immediate-send path below run.
    const rawScheduledAt = data.scheduled_at;
    const isFutureScheduled =
      rawScheduledAt && new Date(rawScheduledAt).getTime() > Date.now();
    const scheduledAt =
      rawScheduledAt && rawScheduledAt.length > 0
        ? rawScheduledAt
        : new Date().toISOString();

    const campaign = await adminRepository.createCampaign({
      title: data.title,
      body: data.body,
      type: data.type,
      target: data.target,
      targetUserIds: data.target_user_ids,
      imageUrl: data.image_url,
      scheduledAt: scheduledAt,
      payload: { v: 1, ...payload },
      createdBy: adminId,
    });

    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "notification_campaign",
      entityId: campaign.id,
      after: campaign,
      ...ctx,
    });

    if (!isFutureScheduled) {
      // Fire immediately. Resolve recipient list with the same logic the
      // scheduler uses, then send + mark as sent.
      try {
        let userIds: string[] = [];
        if (data.target === "all") {
          const { rows } = await pool.query(
            `SELECT DISTINCT u.id AS user_id
               FROM users u
               LEFT JOIN push_tokens pt ON pt.user_id = u.id AND pt.is_active = true
               LEFT JOIN notification_preferences np ON np.user_id = u.id
              WHERE u.is_active = true
                AND (pt.id IS NOT NULL OR COALESCE(np.email_notifications, true) = true)
                AND COALESCE(np.promotions, false) = true`,
          );
          userIds = rows.map((r) => r.user_id);
        } else if (data.target === "user" && data.target_user_ids) {
          userIds = data.target_user_ids;
        }

        const result = await notificationService.sendCustomNotification({
          userIds,
          title: data.title,
          body: data.body,
          payload: { v: 1, ...payload, campaignId: campaign.id },
          campaignId: campaign.id,
          imageUrl: data.image_url,
          eventType: "campaign",
        });
        await adminRepository.updateCampaignStatus(
          campaign.id,
          "sent",
          result.sent + result.logged,
        );
      } catch (err) {
        await adminRepository
          .updateCampaignStatus(campaign.id, "failed")
          .catch(() => {});
        logger.error(`Immediate send for campaign ${campaign.id} failed:`, err);
        throw appError("Error al enviar notificación push", 500, "EXPO_PUSH_FAILED");
      }
    }

    return campaign;
  },

  // ─── Categories ─────────────────────────────────────

  async getCategories(page: number, limit: number) {
    const { rows, total } = await adminRepository.findAllCategories(page, limit);
    return {
      data: rows,
      meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
    };
  },

  async createCategory(data: any, adminId: string, ctx?: AuditCtx) {
    const category = await adminRepository.createCategory(data);
    await adminRepository.createAuditLog({
      adminId,
      action: "create",
      entity: "category",
      entityId: category.id,
      after: category,
      ...ctx,
    });
    return category;
  },

  async updateCategory(id: string, data: any, adminId: string, ctx?: AuditCtx) {
    const category = await adminRepository.updateCategory(id, data);
    if (!category) return null;
    await adminRepository.createAuditLog({
      adminId,
      action: "update",
      entity: "category",
      entityId: id,
      after: category,
      ...ctx,
    });
    return category;
  },

  async deleteCategory(id: string, adminId: string, ctx?: AuditCtx) {
    const category = await adminRepository.deleteCategory(id);
    if (!category) return null;
    await adminRepository.createAuditLog({
      adminId,
      action: "delete",
      entity: "category",
      entityId: id,
      ...ctx,
    });
    return { message: "Categoría desactivada" };
  },
};
