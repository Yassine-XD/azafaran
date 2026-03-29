/**
 * Notification Service
 */

import { AppError } from "../types/api";
import notificationRepository from "../repositories/notification.repository";
import logger from "../utils/logger";

class NotificationService {
  async getUserNotifications(userId: string, filters: any) {
    const { page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      notificationRepository.find({ user_id: userId }, skip, limit),
      notificationRepository.count({ user_id: userId }),
    ]);

    return {
      data: notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getNotificationById(id: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new AppError("Notification not found", 404);
    }
    return notification;
  }

  async markAsRead(id: string) {
    const result = await notificationRepository.update(id, { read: true });
    if (!result) {
      throw new AppError("Notification not found", 404);
    }
    logger.info(`Notification marked as read: ${id}`);
  }

  async markAllAsRead(userId: string) {
    await notificationRepository.updateMany(
      { user_id: userId },
      { read: true },
    );
    logger.info(`All notifications marked as read for user ${userId}`);
  }

  async deleteNotification(id: string) {
    const result = await notificationRepository.delete(id);
    if (!result) {
      throw new AppError("Notification not found", 404);
    }
    logger.info(`Notification deleted: ${id}`);
  }

  async sendNotification(userId: string, data: any) {
    const notification = await notificationRepository.create({
      user_id: userId,
      ...data,
      read: false,
      created_at: new Date(),
    });
    logger.info(`Notification sent to user ${userId}`);
    return notification;
  }
}

export default new NotificationService();
