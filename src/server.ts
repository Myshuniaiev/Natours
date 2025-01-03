import mongoose from "mongoose";
import "module-alias/register";

import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

import app from "./app";

process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const DB = process.env.DATABASE_URL?.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD || ""
);

if (!DB) {
  throw new Error("Database URL not found in environment variables.");
}

// Mongoose connection with async/await and error handling
(async () => {
  try {
    await mongoose.connect(DB);
    console.log("DB connection successful!");
  } catch (err) {
    console.error("DB connection error: ", err);
    process.exit(1);
  }
})();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown on SIGTERM
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated!");
  });
});
