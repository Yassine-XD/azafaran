import { orderRepository } from "../repositories/order.repository";
import { cartRepository } from "../repositories/cart.repository";
import { userRepository } from "../repositories/user.repository";
import { productRepository } from "../repositories/product.repository";
import { cartService } from "./cart.service";
import type {
  PlaceOrderInput,
  ReviewOrderInput,
} from "../validators/order.schema";

const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_MIN = 40.0;

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function formatOrder(order: any) {
  return {
    ...order,
    subtotal: parseFloat(order.subtotal),
    delivery_fee: parseFloat(order.delivery_fee),
    discount_amount: parseFloat(order.discount_amount),
    total: parseFloat(order.total),
    items: order.items?.map((item: any) => ({
      ...item,
      unit_price: parseFloat(item.unit_price),
      line_total: parseFloat(item.line_total),
    })),
  };
}

export const orderService = {
  async placeOrder(userId: string, input: PlaceOrderInput) {
    // 1. Get cart and validate
    const { cart, items } = await cartRepository.getCartWithItems(userId);
    if (items.length === 0)
      throw appError("El carrito está vacío", 400, "CART_EMPTY");

    // 2. Validate cart (stock + prices)
    const validation = await cartService.validateCart(userId);
    if (!validation.valid) {
      throw appError(validation.errors.join(". "), 400, "CART_INVALID");
    }

    // 3. Verify delivery slot
    const slot = await orderRepository.findDeliverySlot(input.delivery_slot_id);
    if (!slot)
      throw appError("Franja horaria no disponible", 400, "SLOT_NOT_AVAILABLE");

    // 4. Get address and snapshot it
    const address = await userRepository.findAddressById(
      input.address_id,
      userId,
    );
    if (!address)
      throw appError("Dirección no encontrada", 404, "ADDRESS_NOT_FOUND");

    const addressSnapshot = {
      label: address.label,
      street: address.street,
      city: address.city,
      postcode: address.postcode,
      province: address.province,
      country: address.country,
      instructions: address.instructions,
    };

    // 5. Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + parseFloat(item.current_price!) * item.quantity,
      0,
    );

    // 6. Apply promo code if provided
    let discountAmount = 0;
    let promoCodeId: string | undefined;
    let freeDelivery = false;

    if (input.promo_code) {
      const promo = await orderRepository.findPromoCode(input.promo_code);
      if (!promo)
        throw appError(
          "Código promocional inválido",
          400,
          "INVALID_PROMO_CODE",
        );

      const usageCount = await orderRepository.findPromoUsageByUser(
        promo.id,
        userId,
      );
      if (usageCount >= promo.max_uses_per_user) {
        throw appError(
          "Ya has utilizado este código",
          400,
          "PROMO_ALREADY_USED",
        );
      }

      promoCodeId = promo.id;
      if (promo.type === "percent") {
        discountAmount = (subtotal * parseFloat(promo.value)) / 100;
      } else if (promo.type === "fixed") {
        discountAmount = Math.min(parseFloat(promo.value), subtotal);
      } else if (promo.type === "free_delivery") {
        freeDelivery = true;
      }
    }

    // 7. Delivery fee
    const deliveryFee =
      subtotal >= FREE_DELIVERY_MIN || freeDelivery ? 0 : DELIVERY_FEE;

    const total = subtotal - discountAmount + deliveryFee;

    // 8. Build order items with product snapshots
    const orderItems = items.map((item) => ({
      variantId: item.variant_id,
      productSnapshot: {
        name: item.product_name,
        variant_label: item.variant_label,
        weight_grams: item.weight_grams,
        halal_cert_id: item.halal_cert_id,
        images: item.product_images,
      },
      quantity: item.quantity,
      unitPrice: parseFloat(item.current_price!),
      lineTotal: parseFloat(item.current_price!) * item.quantity,
    }));

    // 9. Create order in DB (atomic — also decrements stock + increments slot)
    const order = await orderRepository.create({
      userId,
      addressId: input.address_id,
      addressSnapshot,
      paymentMethod: input.payment_method,
      paymentRef: input.payment_ref,
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      promoCodeId,
      deliverySlotId: input.delivery_slot_id,
      deliveryNotes: input.delivery_notes,
      items: orderItems,
    });

    // 10. Clear cart after successful order
    await cartRepository.clearCart(cart.id);

    return formatOrder({ ...order, items: orderItems });
  },

  async getOrders(userId: string, page: number, limit: number, period?: string) {
    // Calculate dateFrom based on period filter
    let dateFrom: string | undefined;
    if (period) {
      const now = new Date();
      const days: Record<string, number> = { "3d": 3, "7d": 7, "30d": 30 };
      const d = days[period];
      if (d) {
        now.setDate(now.getDate() - d);
        dateFrom = now.toISOString();
      }
    }

    const { rows, total } = await orderRepository.findByUserId(
      userId,
      page,
      limit,
      dateFrom,
    );
    return {
      orders: rows.map(formatOrder),
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  },

  async getOrderById(userId: string, orderId: string) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) throw appError("Pedido no encontrado", 404, "ORDER_NOT_FOUND");
    return formatOrder(order);
  },

  async cancelOrder(userId: string, orderId: string) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) throw appError("Pedido no encontrado", 404, "ORDER_NOT_FOUND");

    if (order.status !== "pending") {
      throw appError(
        "Solo se pueden cancelar pedidos en estado pendiente",
        400,
        "ORDER_CANNOT_BE_CANCELLED",
      );
    }

    await orderRepository.updateStatus(orderId, "cancelled");
    return { message: "Pedido cancelado correctamente" };
  },

  async reorder(userId: string, orderId: string) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) throw appError("Pedido no encontrado", 404, "ORDER_NOT_FOUND");

    const cart = await cartRepository.findOrCreateCart(userId);
    const added: string[] = [];
    const skipped: string[] = [];

    for (const item of order.items) {
      if (!item.variant_id) {
        skipped.push(item.product_snapshot?.name || "Producto eliminado");
        continue;
      }

      const variant = await productRepository.findVariantById(item.variant_id);

      if (!variant || variant.stock_qty === 0) {
        skipped.push(item.product_snapshot?.name);
        continue;
      }

      const qty = Math.min(item.quantity, variant.stock_qty);
      await cartRepository.addItem(
        cart.id,
        item.variant_id,
        qty,
        parseFloat(variant.price),
      );
      added.push(item.product_snapshot?.name);
    }

    return {
      added,
      skipped,
      message:
        skipped.length > 0
          ? `${added.length} productos añadidos. ${skipped.length} no disponibles.`
          : `${added.length} productos añadidos al carrito.`,
    };
  },

  async reviewOrder(userId: string, orderId: string, input: ReviewOrderInput) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) throw appError("Pedido no encontrado", 404, "ORDER_NOT_FOUND");

    if (order.status !== "delivered") {
      throw appError(
        "Solo puedes valorar pedidos entregados",
        400,
        "ORDER_NOT_DELIVERED",
      );
    }

    const hasReview = await orderRepository.existsReview(orderId);
    if (hasReview) {
      throw appError(
        "Ya has valorado este pedido",
        400,
        "REVIEW_ALREADY_EXISTS",
      );
    }

    await orderRepository.createReview(
      orderId,
      userId,
      input.rating,
      input.comment,
    );
    return { message: "¡Gracias por tu valoración!" };
  },
};
