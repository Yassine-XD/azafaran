/**
 * Audit Service
 */

import { AppError } from "../types/api";
import auditRepository from "../repositories/audit.repository";
import logger from "../utils/logger";

class AuditService {
  async logAction(
    userId: string,
    action: string,
    resource: string,
    details: any,
  ) {
    const audit = await auditRepository.create({
      user_id: userId,
      action,
      resource,
      details,
      timestamp: new Date(),
      ip_address: details.ip,
      user_agent: details.userAgent,
    });

    logger.info(`Audit logged: ${action} on ${resource} by user ${userId}`);
    return audit;
  }

  async getAuditLogs(filters: any) {
    const { page = 1, limit = 50, userId, action, resource } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (userId) query.user_id = userId;
    if (action) query.action = action;
    if (resource) query.resource = resource;

    const [logs, total] = await Promise.all([
      auditRepository.find(query, skip, limit),
      auditRepository.count(query),
    ]);

    return {
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}

export default new AuditService();
