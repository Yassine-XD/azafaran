import { promotionRepository } from "../repositories/promotion.repository";
import { orderRepository } from "../repositories/order.repository";

function appError(message: string, statusCode: number, code: string) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function formatPromotion(promo: any) {
  return {
    ...promo,
    discount_value: promo.discount_value
      ? parseFloat(promo.discount_value)
      : null,
  };
}

export const promotionService = {
  async getActivePromotions() {
    const rows = await promotionRepository.findHomePromotions();
    return rows.map(formatPromotion);
  },

  async getBanners() {
    return promotionRepository.findActiveBanners();
  },

  async validatePromoCode(code: string, userId?: string) {
    const promo = await orderRepository.findPromoCode(code);
    if (!promo) {
      throw appError(
        "Código promocional inválido o expirado",
        400,
        "INVALID_PROMO_CODE",
      );
    }

    if (userId) {
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
    }

    return {
      id: promo.id,
      code: promo.code,
      type: promo.type,
      value: parseFloat(promo.value),
      min_order_amount: parseFloat(promo.min_order_amount),
      free_delivery: promo.type === "free_delivery",
    };
  },
};
