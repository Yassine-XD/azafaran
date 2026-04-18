import { cartRepository } from "../repositories/cart.repository";
import { productRepository } from "../repositories/product.repository";
import { orderRepository } from "../repositories/order.repository";
import { resolveI18n } from "../utils/i18n";
import type {
  AddToCartInput,
  UpdateCartItemInput,
  ApplyPromoInput,
} from "../validators/cart.schema";

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function formatCartItem(item: any, lang = 'es') {
  return {
    ...item,
    product_name: resolveI18n(item.product_name_i18n, item.product_name, lang),
    variant_label: resolveI18n(item.variant_label_i18n, item.variant_label, lang),
    unit_price: parseFloat(item.unit_price),
    current_price: parseFloat(item.current_price),
    price_changed:
      parseFloat(item.unit_price) !== parseFloat(item.current_price),
  };
}

export const cartService = {
  async getCart(userId: string, lang = 'es') {
    const { cart, items } = await cartRepository.getCartWithItems(userId);

    const formatted = items.map((item) => formatCartItem(item, lang));

    const subtotal = formatted.reduce(
      (sum, item) => sum + item.current_price * item.quantity,
      0,
    );

    return {
      id: cart.id,
      updated_at: cart.updated_at,
      items: formatted,
      subtotal: parseFloat(subtotal.toFixed(2)),
      item_count: formatted.reduce((sum, item) => sum + item.quantity, 0),
    };
  },

  async addItem(userId: string, input: AddToCartInput, lang = 'es') {
    // Verify variant exists and has stock
    const variant = await productRepository.findVariantById(input.variant_id);
    if (!variant) {
      throw appError(
        "Variante de producto no encontrada",
        404,
        "VARIANT_NOT_FOUND",
      );
    }
    if (variant.stock_qty < input.quantity) {
      throw appError(
        `Stock insuficiente. Disponible: ${variant.stock_qty}`,
        400,
        "INSUFFICIENT_STOCK",
      );
    }

    const cart = await cartRepository.findOrCreateCart(userId);
    await cartRepository.addItem(
      cart.id,
      input.variant_id,
      input.quantity,
      parseFloat(variant.price),
    );

    return cartService.getCart(userId, lang);
  },

  async updateItem(userId: string, itemId: string, input: UpdateCartItemInput, lang = 'es') {
    const { cart } = await cartRepository.getCartWithItems(userId);
    const item = await cartRepository.findCartItem(cart.id, itemId);

    if (!item)
      throw appError(
        "Artículo no encontrado en el carrito",
        404,
        "CART_ITEM_NOT_FOUND",
      );

    if (input.quantity === 0) {
      await cartRepository.removeItem(itemId);
    } else {
      // Check stock for new quantity
      const variant = await productRepository.findVariantById(item.variant_id);
      if (!variant || variant.stock_qty < input.quantity) {
        throw appError("Stock insuficiente", 400, "INSUFFICIENT_STOCK");
      }
      await cartRepository.updateItemQuantity(itemId, input.quantity);
    }

    return cartService.getCart(userId, lang);
  },

  async removeItem(userId: string, itemId: string, lang = 'es') {
    const { cart } = await cartRepository.getCartWithItems(userId);
    const item = await cartRepository.findCartItem(cart.id, itemId);

    if (!item)
      throw appError(
        "Artículo no encontrado en el carrito",
        404,
        "CART_ITEM_NOT_FOUND",
      );

    await cartRepository.removeItem(itemId);
    return cartService.getCart(userId, lang);
  },

  async clearCart(userId: string) {
    const cart = await cartRepository.findOrCreateCart(userId);
    await cartRepository.clearCart(cart.id);
    return { message: "Carrito vaciado correctamente" };
  },

  async validateCart(userId: string) {
    const { items } = await cartRepository.getCartWithItems(userId);

    if (items.length === 0) {
      throw appError("El carrito está vacío", 400, "CART_EMPTY");
    }

    const warnings: string[] = [];
    const errors: string[] = [];

    for (const item of items) {
      const currentPrice = parseFloat(item.current_price!);
      const savedPrice = parseFloat(item.unit_price);

      // Check stock
      if ((item.stock_qty ?? 0) < item.quantity) {
        if ((item.stock_qty ?? 0) === 0) {
          errors.push(`"${item.product_name}" ya no está disponible`);
        } else {
          warnings.push(
            `"${item.product_name}": solo quedan ${item.stock_qty} unidades`,
          );
        }
      }

      // Check price change
      if (Math.abs(currentPrice - savedPrice) > 0.01) {
        warnings.push(
          `El precio de "${item.product_name}" ha cambiado de €${savedPrice.toFixed(2)} a €${currentPrice.toFixed(2)}`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  },

  async applyPromo(userId: string, input: ApplyPromoInput) {
    const promo = await orderRepository.findPromoCode(input.code);

    if (!promo) {
      throw appError(
        "Código promocional inválido o expirado",
        400,
        "INVALID_PROMO_CODE",
      );
    }

    // Check per-user limit
    const usageCount = await orderRepository.findPromoUsageByUser(
      promo.id,
      userId,
    );
    if (usageCount >= promo.max_uses_per_user) {
      throw appError(
        "Ya has utilizado este código promocional",
        400,
        "PROMO_ALREADY_USED",
      );
    }

    // Check min order amount
    const cart = await cartService.getCart(userId);
    if (cart.subtotal < parseFloat(promo.min_order_amount)) {
      throw appError(
        `Pedido mínimo de €${parseFloat(promo.min_order_amount).toFixed(2)} para este código`,
        400,
        "PROMO_MIN_ORDER_NOT_MET",
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.type === "percent") {
      discountAmount = (cart.subtotal * parseFloat(promo.value)) / 100;
    } else if (promo.type === "fixed") {
      discountAmount = Math.min(parseFloat(promo.value), cart.subtotal);
    }

    return {
      promo_code_id: promo.id,
      code: promo.code,
      type: promo.type,
      value: parseFloat(promo.value),
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      free_delivery: promo.type === "free_delivery",
    };
  },
};
