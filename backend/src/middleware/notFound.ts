import { Request, Response } from "express";

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta no encontrada: ${req.method} ${req.path}`,
      code: "NOT_FOUND",
    },
  });
}
