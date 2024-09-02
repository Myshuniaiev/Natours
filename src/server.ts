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

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.log("DB connection error: ", err));

// Define an interface for the Tour document
interface ITour extends Document {
  name: string;
  rating: number;
  price: number;
}

// Define the schema with TypeScript type annotations
const tourSchema: Schema<ITour> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
});

// Create the model with a generic type argument
const Tour: Model<ITour> = mongoose.model<ITour>("Tour", tourSchema);

const testTour = new Tour({
  name: "The Forest Hiker",
  rating: 4.7,
  price: 497,
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
