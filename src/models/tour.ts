import mongoose, { Schema, Model, Query, Document } from "mongoose";
import slugify from "slugify";

import User from "@models/user";
import AppError from "@utils/appError";
import { ITour, TourDifficultyEnum } from "@mytypes/tour";

// Schema definition
const tourSchema: Schema<ITour> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal than 40 characters"],
      minlength: [10, "A tour name must have at least 10 characters"],
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
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: Object.values(TourDifficultyEnum),
        message: "Difficulty is either: easy, medium, or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val: number) => Math.round(val * 10) / 10,
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
      validate: {
        validator: function (this: ITour, val: number) {
          return val < this.price;
        },
        message: "Discount price ({VALUE}) should be below regular price",
      },
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
    images: [String],
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          enum: "Point",
          default: "Point",
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    guides: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    strict: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

// Document middleware
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre("save", async function (next) {
  try {
    const guidesPromises = this.guides.map(async (id) => {
      const guide = await User.findById(id);
      if (!guide) {
        throw new Error(`No user found with id ${id}`);
      }
      return guide;
    });

    this.guides = await Promise.all(guidesPromises);
    next();
  } catch (error) {
    next(new AppError(error as string, 500));
  }
});

// Query middleware
tourSchema.pre(/^find/, function (this: Query<ITour, Document>, next) {
  this.populate({ path: "guides", select: "-__v -passwordChangedAt" });
  next();
});
tourSchema.pre(/^find/, function (this: Query<ITour, Document>, next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

// Virtual population
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// TODO Aggregation middleware
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

// Model creation
const Tour: Model<ITour> = mongoose.model<ITour>("Tour", tourSchema);

export default Tour;
