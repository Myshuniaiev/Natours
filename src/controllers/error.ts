import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set defaults for error status and status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Send structured error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
