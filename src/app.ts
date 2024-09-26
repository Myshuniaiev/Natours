import express, { Application, Response, NextFunction, Request } from "express";
import morgan from "morgan";
import path from "path";
import { rateLimit } from "express-rate-limit";

import AppError from "./utils/appError";

import tourRouter from "./routes/tour";
import userRouter from "./routes/user";
import { globalErrorHandler } from "./controllers/error";

const app: Application = express();

// Log development environment requests with morgan
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too many requests from this IP, please try again later",
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false,
});

app.use("/api", limiter);

// Parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// Handle undefined routes with custom error
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
