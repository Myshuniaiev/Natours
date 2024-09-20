import express, { Application, Response, NextFunction } from "express";
import morgan from "morgan";
import path from "path";

import AppError from "./utils/appError";

import tourRouter from "./routes/tour";
import userRouter from "./routes/user";
import { globalErrorHandler } from "./controllers/error";
import { IRequest } from "./types/types";

const app: Application = express();

// Log development environment requests with morgan
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// Handle undefined routes with custom error
app.all("*", (req: IRequest, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
