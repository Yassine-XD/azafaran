import path from "path";
import fs from "fs";
import { ticketRepository, AttachmentInput } from "../repositories/ticket.repository";
import { emailService } from "./email.service";
import { sseClients } from "../utils/sseClients";
import { logger } from "../utils/logger";

function fileToAttachment(f: Express.Multer.File): AttachmentInput {
  return {
    file_url: `/uploads/tickets/${path.basename(f.path)}`,
    file_name: f.originalname,
    mime_type: f.mimetype,
    size_bytes: f.size,
  };
}

function cleanupFiles(files: Express.Multer.File[] | undefined) {
  if (!files) return;
  for (const f of files) {
    fs.unlink(f.path, () => {});
  }
}

async function attachMessagesToTicket(ticket: any) {
  const messages = await ticketRepository.findMessagesWithAttachments(
    ticket.id,
  );
  return { ...ticket, messages };
}

export class NotFoundError extends Error {
  code = "NOT_FOUND";
  status = 404;
}

export const ticketService = {
  async listForUser(
    userId: string,
    filters: { status?: string; page: number; limit: number },
  ) {
    return ticketRepository.list({ userId, ...filters });
  },

  async listForAdmin(filters: {
    status?: string;
    category?: string;
    priority?: string;
    q?: string;
    page: number;
    limit: number;
  }) {
    return ticketRepository.list(filters);
  },

  async getForUser(ticketId: string, userId: string) {
    const ticket = await ticketRepository.findByIdForUser(ticketId, userId);
    if (!ticket) throw new NotFoundError("Ticket no encontrado");
    if (ticket.unread_for_user) {
      await ticketRepository.markReadForUser(ticketId);
      ticket.unread_for_user = false;
    }
    return attachMessagesToTicket(ticket);
  },

  async getForAdmin(ticketId: string) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) throw new NotFoundError("Ticket no encontrado");
    if (ticket.unread_for_admin) {
      await ticketRepository.markReadForAdmin(ticketId);
      ticket.unread_for_admin = false;
    }
    return attachMessagesToTicket(ticket);
  },

  async createTicket(params: {
    userId: string;
    subject: string;
    category: string;
    body: string;
    files?: Express.Multer.File[];
  }) {
    const attachments = (params.files || []).map(fileToAttachment);

    let result;
    try {
      result = await ticketRepository.createTicketWithFirstMessage({
        userId: params.userId,
        subject: params.subject,
        category: params.category,
        body: params.body,
        attachments,
      });
    } catch (err) {
      cleanupFiles(params.files);
      throw err;
    }

    // Fire-and-forget notifications
    sseClients.emit("new_ticket", {
      id: result.ticket.id,
      ticket_number: result.ticket.ticket_number,
      subject: result.ticket.subject,
      category: result.ticket.category,
    });

    emailService
      .notifyAdminNewTicket(params.userId, {
        ticket_number: result.ticket.ticket_number,
        subject: result.ticket.subject,
        category: result.ticket.category,
      })
      .catch((e) => logger.error("notifyAdminNewTicket failed:", e));

    return attachMessagesToTicket(result.ticket);
  },

  async addUserMessage(params: {
    ticketId: string;
    userId: string;
    body: string;
    files?: Express.Multer.File[];
  }) {
    const existing = await ticketRepository.findByIdForUser(
      params.ticketId,
      params.userId,
    );
    if (!existing) {
      cleanupFiles(params.files);
      throw new NotFoundError("Ticket no encontrado");
    }

    const attachments = (params.files || []).map(fileToAttachment);

    let result;
    try {
      result = await ticketRepository.addMessage({
        ticketId: params.ticketId,
        senderType: "user",
        senderId: params.userId,
        body: params.body,
        attachments,
        reopenIfClosed: true,
      });
    } catch (err) {
      cleanupFiles(params.files);
      throw err;
    }

    sseClients.emit("new_ticket_message", {
      ticket_id: params.ticketId,
      ticket_number: result.ticket.ticket_number,
      sender_type: "user",
    });

    return attachMessagesToTicket(result.ticket);
  },

  async addAdminMessage(params: {
    ticketId: string;
    adminId: string;
    body: string;
    files?: Express.Multer.File[];
  }) {
    const existing = await ticketRepository.findById(params.ticketId);
    if (!existing) {
      cleanupFiles(params.files);
      throw new NotFoundError("Ticket no encontrado");
    }

    const attachments = (params.files || []).map(fileToAttachment);

    let result;
    try {
      result = await ticketRepository.addMessage({
        ticketId: params.ticketId,
        senderType: "admin",
        senderId: params.adminId,
        body: params.body,
        attachments,
        reopenIfClosed: false,
      });
    } catch (err) {
      cleanupFiles(params.files);
      throw err;
    }

    emailService
      .sendTicketReply(
        existing.user_id,
        {
          ticket_number: result.ticket.ticket_number,
          subject: result.ticket.subject,
        },
        params.body,
      )
      .catch((e) => logger.error("sendTicketReply failed:", e));

    return attachMessagesToTicket(result.ticket);
  },

  async adminUpdate(
    ticketId: string,
    data: {
      status?: string;
      priority?: string;
      assigned_to?: string | null;
    },
  ) {
    const existing = await ticketRepository.findById(ticketId);
    if (!existing) throw new NotFoundError("Ticket no encontrado");
    return ticketRepository.adminUpdate(ticketId, data);
  },
};
