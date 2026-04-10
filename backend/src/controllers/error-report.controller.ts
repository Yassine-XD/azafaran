import { Request, Response } from "express";
import { emailService } from "../services/email.service";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";

export const errorReportController = {
  report: asyncHandler(async (req: Request, res: Response) => {
    const { message, stack, url, component, userId } = req.body;

    await emailService.notifyAdminError({
      message,
      stack,
      url,
      component,
      userAgent: req.headers["user-agent"],
    });

    return success(res, { message: "Error report received" }, 201);
  }),
};
