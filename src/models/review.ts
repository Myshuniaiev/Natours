import mongoose, { Schema, Model, Query, Document } from "mongoose";

import { IReview } from "@mytypes/review";

// Schema definition
const reviewSchema: Schema<IReview> = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A tour must have a review"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "A tour must have a rating"],
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: [true, "A review must belong to a tour"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A review must belong to a user"],
    },
  },
  {
    strict: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Query middleware
reviewSchema.pre(/^find/, function (this: Query<IReview, Document>, next) {
  this.populate({ path: "user", select: "-__v -passwordChangedAt" });
  next();
});
reviewSchema.pre(/^find/, function (this: Query<IReview, Document>, next) {
  this.populate({ path: "tour" });
  next();
});

// Model creation
const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
