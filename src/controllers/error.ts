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

const handleValidationErrorDB = (err: ExtendedError) => {
  // console.log(err.error)
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Validation Error. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJwtError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJwtTokenExpiredError = () =>
  new AppError("Token has expired. Please log in again.", 401);

const sendErrorDev = (err: AppError, res: Response) => {
  console.log("Error: 💥", err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

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

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error: AppError | ExtendedError = { ...err };

    if ((err as ExtendedError).name === "CastError") {
      error = handleCastErrorDB(error);
    } else if ((err as ExtendedError).code === 11000) {
      error = handleDuplicatedFieldsDB(error);
    } else if ((err as ExtendedError).name === "ValidationError") {
      error = handleValidationErrorDB(error);
    } else if ((err as ExtendedError).name === "JsonWebTokenError") {
      error = handleJwtError();
    } else if ((err as ExtendedError).name === "TokenExpiredError") {
      error = handleJwtTokenExpiredError();
    }

    sendErrorProd(error, res);
  } else {
    res.status(500).json({
      error:
        "NODE_ENV is not defined. Please check your environment configuration.",
    });
  }
};
