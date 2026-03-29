/**
 * Promotion Service
 */

import { AppError } from "../types/api";
import promotionRepository from "../repositories/promotion.repository";
import logger from "../utils/logger";

class PromotionService {
  async getAllPromotions(filters: any) {
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const query = { active: true, expiry_date: { $gte: new Date() } };

    const [promotions, total] = await Promise.all([
      promotionRepository.find(query, skip, limit),
      promotionRepository.count(query),
    ]);

    return {
      data: promotions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getPromotionById(id: string) {
    const promotion = await promotionRepository.findById(id);
    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }
    return promotion;
  }

  async validatePromoCode(code: string, userId?: string) {
    const promotion = await promotionRepository.findByCode(code);
    if (!promotion || !promotion.active) {
      throw new AppError("Invalid promo code", 400);
    }

    if (promotion.expiry_date < new Date()) {
      throw new AppError("Promo code expired", 400);
    }

    if (
      promotion.usage_limit &&
      promotion.usage_count >= promotion.usage_limit
    ) {
      throw new AppError("Promo code usage limit reached", 400);
    }

    return {
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      min_purchase: promotion.min_purchase,
    };
  }

  async createPromotion(data: any) {
    const promotion = await promotionRepository.create(data);
    logger.info(`Promotion created: ${promotion.id}`);
    return promotion;
  }

  async updatePromotion(id: string, data: any) {
    const promotion = await promotionRepository.update(id, data);
    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }
    logger.info(`Promotion updated: ${id}`);
    return promotion;
  }

  async deletePromotion(id: string) {
    const result = await promotionRepository.delete(id);
    if (!result) {
      throw new AppError("Promotion not found", 404);
    }
    logger.info(`Promotion deleted: ${id}`);
  }
}

export default new PromotionService();
