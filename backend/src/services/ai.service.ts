/**
 * AI Service - Product description generation and feedback analysis
 * TODO: Install @anthropic-ai/sdk and add ANTHROPIC_API_KEY to env when ready
 */

import { logger } from "../utils/logger";

export const aiService = {
  async generateProductDescription(productData: any): Promise<string> {
    logger.warn("AI service not configured — skipping description generation");
    return "";
  },

  async analyzeProductFeedback(feedback: string): Promise<string> {
    logger.warn("AI service not configured — skipping feedback analysis");
    return "";
  },

  async generateRecommendations(
    userId: string,
    purchaseHistory: any[],
  ): Promise<string> {
    logger.warn("AI service not configured — skipping recommendations");
    return "";
  },
};
