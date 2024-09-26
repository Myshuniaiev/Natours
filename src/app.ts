import express, { Application, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import path from "path";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

import AppError from "./utils/appError";
import tourRouter from "./routes/tour";
import userRouter from "./routes/user";
import { globalErrorHandler } from "./controllers/error";

const app: Application = express();

// Middleware to set security HTTP headers
app.use(helmet());

// Development logging with Morgan (logs requests for easier debugging in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rate limiting to protect against DDoS and brute-force attacks
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60-minute window
  max: 100, // Limit each IP to 100 requests per window (to avoid abuse)
  message: "Too many requests from this IP, please try again after an hour", // Friendly error message for users
  standardHeaders: true, // Enable standard rate limit headers for clients
  legacyHeaders: false, // Disable legacy X-RateLimit-* headers
});

// Apply rate limiter to all API routes
app.use("/api", limiter);

// Middleware to parse incoming JSON payloads
app.use(express.json({ limit: "10kb" }));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// API routes (separated by feature for better modularity)
app.use("/api/v1/tours", tourRouter); // Routes related to tours
app.use("/api/v1/users", userRouter); // Routes related to users

// Catch-all route for unhandled paths (404 error)
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(
    new AppError(
      `The requested URL ${req.originalUrl} was not found on this server.`,
      404
    )
  );
});

// Global error handling middleware (handles all errors in one place)
app.use(globalErrorHandler);

export default app;
