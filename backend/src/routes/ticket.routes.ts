import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { ticketController } from "../controllers/ticket.controller";
import { authenticate } from "../middleware/authenticate";
import { uploadTicketFiles } from "../middleware/uploadTicketFiles";
import { error } from "../utils/apiResponse";

const router = Router();
router.use(authenticate);

function handleUploadErrors(
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE")
      return error(res, "Archivo demasiado grande (máx 8 MB)", 400, "FILE_TOO_LARGE");
    if (err.code === "LIMIT_FILE_COUNT")
      return error(res, "Máximo 5 archivos", 400, "TOO_MANY_FILES");
    return error(res, "Error al subir archivo", 400, "UPLOAD_ERROR");
  }
  if (err && err.message === "INVALID_FILE_TYPE") {
    return error(res, "Tipo de archivo no permitido", 400, "INVALID_FILE_TYPE");
  }
  return next(err);
}

const withFiles = [uploadTicketFiles, handleUploadErrors];

router.get("/", ticketController.list);
router.get("/:id", ticketController.get);
router.post("/", ...withFiles, ticketController.create);
router.post("/:id/messages", ...withFiles, ticketController.reply);

export default router;
