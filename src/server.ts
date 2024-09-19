import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE?.replace(
  "<DB_PASSWORD>",
  process.env.DATABASE_PASSWORD || ""
);

if (!DB) {
  throw new Error("Database URL not found in environment variables.");
}

mongoose.connect(DB);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

process.on("unhandledRejection", (err: Error) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
