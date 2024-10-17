import { NextFunction, Request, Response } from "express";
import APIFeatures from "@utils/apiFeatures";
import catchAsync from "@utils/catchAsync";
import AppError from "@utils/appError";
import Tour from "@models/tour";
import { ITour } from "@mytypes/tour";
import { IRequestWithBody } from "@mytypes/express";

// Handler to get top tours
export const aliasTopTours = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.query.limit = "5";
  req.query.sort = "-ratingAverage,price";
  req.query.fields = "name,price,ratingAverage,summary,difficulty";
  next();
};

// Handler to get all tours
export const getTours = catchAsync(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const features = new APIFeatures<ITour>(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: { tours },
    });
  }
);

// Handler to get a specific tour by ID
export const getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return next(new AppError("No tour found with that ID", 404));
    }
    res.status(200).json({ status: "success", data: { tour } });
  }
);

// Handler to create a new tour
export const createTour = catchAsync(
  async (
    req: IRequestWithBody<ITour>,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: "success", data: { tour: newTour } });
  }
);

// Handler to update a tour
export const updateTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tour) {
      return next(new AppError("No tour found with that ID", 404));
    }
    res.status(200).json({ status: "success", data: { tour } });
  }
);

// Handler to delete a tour
export const deleteTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return next(new AppError("No tour found with that ID", 404));
    }
    res
      .status(200)
      .json({ status: "success", message: "The tour has been deleted." });
  }
);

export const getTourStats = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);
    res.status(200).json({ status: "success", data: { stats } });
  }
);

export const getMonthlyPlan = catchAsync(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const year = Number(req.params.year);
    const stats = await Tour.aggregate([
      { $unwind: "$startDates" },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStats: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      { $addFields: { month: "$_id" } },
      { $project: { _id: 0 } },
      { $sort: { numTourStats: -1 } },
    ]);
    res
      .status(200)
      .json({ status: "success", results: stats.length, data: { stats } });
  }
);
