import mongoose, { Schema, Document, Model } from "mongoose";
import slugify from "slugify";

// Define an interface for the Tour document
export interface ITour extends Document {
  name: string;
  slug?: string;
  duration: number;
  maxGroupSize: number;
  difficulty: "easy" | "medium" | "difficult";
  ratingsAverage: number;
  ratingQuantity: number;
  price: number;
  priceDiscount: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  startDates: Date[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the schema with TypeScript type annotations
const tourSchema: Schema<ITour> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a groupSize"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: {
      type: [String],
    },
    startDates: {
      type: [Date],
    },
  },
  {
    strict: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Create the model with a generic type argument
const Tour: Model<ITour> = mongoose.model<ITour>("Tour", tourSchema);

export default Tour;
