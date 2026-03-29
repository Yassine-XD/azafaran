/**
 * AI Service - Anthropic Proxy
 */

import Anthropic from '@anthropic-ai/sdk';
import logger from '../utils/logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class AIService {
  async generateProductDescription(productData: any) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Generate a compelling product description for: ${JSON.stringify(productData)}`,
          },
        ],
      });

      return message.content[0].type === 'text' ? message.content[0].text : '';
    } catch (error) {
      logger.error('AI generation error:', error);
      throw error;
    }
  }

  async analyzeProductFeedback(feedback: string) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `Analyze this product feedback and provide sentiment and key points: ${feedback}`,
          },
        ],
      });

      return message.content[0].type === 'text' ? message.content[0].text : '';
    } catch (error) {
      logger.error('AI analysis error:', error);
      throw error;
    }
  }

  async generateRecommendations(userId: string, purchaseHistory: any[]) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,