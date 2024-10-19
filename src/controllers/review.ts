import { NextFunction, Request, Response } from "express";

import APIFeatures from "@utils/apiFeatures";
import catchAsync from "@utils/catchAsync";
import AppError from "@utils/appError";
import Review from "@models/review";
import { IReview } from "@mytypes/review";
import { IRequestWithBody } from "@mytypes/express";
import Tour from "@models/tour";
import * as factory from "@controllers/handlerFactory";


// Handler to get all reviews
export const getReviews = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    let filter = {};
    const { tourId } = req.params;

    const foundTour = await Tour.findById(tourId);
    if (foundTour) {
      filter = { tour: tourId };
    }

    const features = new APIFeatures<IReview>(Review.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const reviews = await features.query;

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: { reviews },
    });
  }
);

// Handler to get a specific review by ID
export const getReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(new AppError("No review found with that ID", 404));
    }
    res.status(200).json({ status: "success", data: { review } });
  }
);

// Handler to create a new review
export const createReview = catchAsync(
  async (
    req: IRequestWithBody<IReview>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { tourId } = req.params;
    const { tour, user } = req.body;

    if (!tour) {
      if (!tourId) {
        return next(new AppError("Please provide a tour id.", 400));
      }
      const foundTour = await Tour.findById(tourId);
      if (!foundTour) {
        return next(new AppError("Tour with provided id does not exist.", 404));
      }
      req.body.tour = foundTour.id;
    }
    if (!user) {
      req.body.user = req.user.id;
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      status: "success",
      data: { review },
    });
  }
);

// Handler to update a review
export const updateReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) {
      return next(new AppError("No review found with that ID", 404));
    }
    res.status(200).json({ status: "success", data: { review } });
  }
);

// Handler to delete a review
export const deleteReview = factory.deleteOne(Review);
