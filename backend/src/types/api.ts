/**
 * Standard API types
 */

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || "INTERNAL_ERROR";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
