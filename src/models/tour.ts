import mongoose, { Schema, Document, Model } from "mongoose";

// Define an interface for the Tour document
export interface ITour extends Document {
  name: string;
  rating: number;
  price: number;
}

// Define the schema with TypeScript type annotations
const tourSchema: Schema<ITour> = new mongoose.Schema(
  {
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
  },
  { strict: true, timestamps: true }
);

// Create the model with a generic type argument
const Tour: Model<ITour> = mongoose.model<ITour>("Tour", tourSchema);

export default Tour;
