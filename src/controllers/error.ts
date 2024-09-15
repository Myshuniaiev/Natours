import { NextFunction, Request, Response } from "express";
import AppError, { ExtendedError } from "../utils/appError";

const handleCastErrorDB = (err: ExtendedError) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
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
  err: AppError | ExtendedError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  console.log("NODE_ENV: ", process.env.NODE_ENV);

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error: AppError | ExtendedError = { ...err };

    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }

    sendErrorProd(error, res);
  }
};
