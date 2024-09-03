import mongoose, { Schema, Document, Model } from "mongoose";
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

mongoose.connect(DB).catch((err) => console.log("DB connection error: ", err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
