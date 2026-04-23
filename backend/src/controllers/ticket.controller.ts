import { Request, Response } from "express";
import { ticketService, NotFoundError } from "../services/ticket.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success, error } from "../utils/apiResponse";
import {
  createTicketSchema,
  createMessageSchema,
} from "../validators/ticket.schema";

function parsePage(req: Request) {
  const page = Math.max(parseInt(String(req.query.page || "1"), 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(String(req.query.limit || "20"), 10) || 20, 1),
    100,
  );
  return { page, limit };
}

export const ticketController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePage(req);
    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const result = await ticketService.listForUser(req.user!.sub, {
      page,
      limit,
      status,
    });

    return success(res, result.rows, 200, {
      total: result.total,
      total_pages: Math.max(Math.ceil(result.total / limit), 1),
      page,
      limit,
    });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    try {
      const ticket = await ticketService.getForUser(
        req.params.id,
        req.user!.sub,
      );
      return success(res, ticket);
    } catch (e: any) {
      if (e instanceof NotFoundError)
        return error(res, e.message, 404, "NOT_FOUND");
      throw e;
    }
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, "Datos inválidos", 400, "VALIDATION_ERROR");
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const ticket = await ticketService.createTicket({
      userId: req.user!.sub,
      subject: parsed.data.subject,
      category: parsed.data.category,
      body: parsed.data.body,
      files,
    });

    return success(res, ticket, 201);
  }),

  reply: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, "Datos inválidos", 400, "VALIDATION_ERROR");
    }

    const files = (req.files as Express.Multer.File[]) || [];
    try {
      const ticket = await ticketService.addUserMessage({
        ticketId: req.params.id,
        userId: req.user!.sub,
        body: parsed.data.body,
        files,
      });
      return success(res, ticket, 201);
    } catch (e: any) {
      if (e instanceof NotFoundError)
        return error(res, e.message, 404, "NOT_FOUND");
      throw e;
    }
  }),
};
