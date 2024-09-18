import { NextFunction, Request, Response } from "express";
import AppError, { ExtendedError } from "../utils/appError";

const handleCastErrorDB = (err: ExtendedError) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicatedFieldsDB = (err: ExtendedError) => {
  const regex = /\{\s*[^:]+:\s*\\"([^\\"]+)\\"/;
  const match = err.errorResponse.errmsg.match(regex);
  const extractedValue = match ? match[1] : null;
  const message = `Duplicated field value ${extractedValue}. Please use another value.`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: AppError, res: Response) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: `error`,
      message: "Something went very wrong!",
    });
  }
};

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error: AppError | ExtendedError = { ...err };

    if ((error as ExtendedError).name === "CastError") {
      error = handleCastErrorDB(error);
    }
    if ((error as ExtendedError).code === 11000) {
      error = handleDuplicatedFieldsDB(error);
    }

    sendErrorProd(error, res);
  }
};
