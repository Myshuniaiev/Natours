export interface ExtendedError extends AppError {
  path?: string;
  value?: string;
  kind?: string;
  name: string; // Error name like "CastError"
}

class AppError extends Error {
  status: string;
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
