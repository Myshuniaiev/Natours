import mongoose, { Model, Query, Schema, Types } from "mongoose";
import Tour from "@models/tour";
import { IReview } from "@mytypes/review";

// Extend the Model interface to include the static method
interface ReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: Types.ObjectId): Promise<void>;
}

// Extend the Query interface to include the 'r' property
interface QueryWithR extends Query<IReview, IReview> {
  r?: IReview | null;
}

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

// Query middleware to populate user information
reviewSchema.pre<Query<IReview, IReview>>(/^find/, function (next) {
  this.populate({ path: "user", select: "name photo" });
  next();
});

// Static method to calculate average ratings
reviewSchema.statics.calcAverageRatings = async function (
  tourId: Types.ObjectId
) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingsAverage: 0, // Default average rating
    });
  }
};

// Middleware to calculate average ratings after saving a review
reviewSchema.post<IReview>("save", async function () {
  await (this.constructor as typeof Review).calcAverageRatings(
    this.tour as Types.ObjectId
  );
});

// Middleware to store the document before an update in pre-findOneAnd
reviewSchema.pre<QueryWithR>(/^findOneAnd/, async function (next) {
  const query = this.getQuery();
  this.r = await this.model.findOne(query);
  next();
});

// Middleware to update the average rating after findOneAnd operations
reviewSchema.post<QueryWithR>(/^findOneAnd/, async function () {
  if (this.r) {
    await (this.r.constructor as ReviewModel).calcAverageRatings(
      this.r.tour as Types.ObjectId
    );
  }
});

// Create the Review model
const Review: ReviewModel = mongoose.model<IReview, ReviewModel>(
   "Review",
  reviewSchema
);

export default Review;
