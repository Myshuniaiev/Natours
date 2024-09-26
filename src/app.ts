import express, { Application, Request, Response, NextFunction } from "express";
import morgan from "morgan";
import path from "path";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss";
import hpp from "hpp";

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

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (value: any) => {
    if (typeof value === "string") {
      return xss(value);
    } else if (typeof value === "object" && value !== null) {
      for (const key in value) {
        value[key] = sanitize(value[key]);
      }
    }
    return value;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);

  next();
};

app.use(sanitizeInput);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "maxGroupSize",
      "difficulty",
      "ratingsAverage",
      "ratingQuantity",
      "price",
    ],
  })
);

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
