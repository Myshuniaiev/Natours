import mongoose, { Schema, Document, Model } from "mongoose";
import slugify from "slugify";
import validator from "validator";

export interface ILocation {
  type: LocationType;
  coordinates: number[];
  address: string;
  description: string;
}
export enum LocationType {
  POINT = "Point",
}

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
  secretTour: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  startLocation: ILocation;
  locations: (ILocation & { day: number })[];
}

// Define the schema with TypeScript type annotations
const tourSchema: Schema<ITour> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal then 40 characters"],
      minlength: [10, "A tour name must have less or equal then 10 characters"],
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
      enum: {
        values: ["easy", "medium", "difficulty"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
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
        validator: function (val: number) {
          let isValid = true;
          if (val < this.price) {
            isValid = false;
          }
          return !isValid;
        },
        message: "Discount price should be below regular price",
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
    images: {
      type: [String],
    },
    startDates: {
      type: [Date],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        enum: Object.values(LocationType),
        default: LocationType.POINT,
      },
      coordinates: {
        type: [Number],
      },
      address: {
        type: String,
      },
      description: {
        type: String,
      },
    },
    locations: [
      {
        type: {
          type: String,
          enum: Object.values(LocationType),
          default: LocationType.POINT,
        },
        coordinates: {
          type: [Number],
        },
        address: {
          type: String,
        },
        description: {
          type: String,
        },
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

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  const query = this as mongoose.Query<any, ITour>;
  // @ts-ignore
  query.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// Create the model with a generic type argument
const Tour: Model<ITour> = mongoose.model<ITour>("Tour", tourSchema);

export default Tour;
