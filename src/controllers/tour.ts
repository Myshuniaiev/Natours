import { NextFunction, Request, Response } from "express";

import catchAsync from "@utils/catchAsync";
import AppError from "@utils/appError";
import Tour from "@models/tour";
import * as factory from "@controllers/handlerFactory";

export const aliasTopTours = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

export const getTourStats = catchAsync(
  async (_req: Request, res: Response): Promise<void> => {
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
  async (req: Request, res: Response): Promise<void> => {
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

export const getToursWithin = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");

    const radius =
      unit === "miles" ? Number(distance) / 3963.2 : Number(distance) / 6378.1;

    if (!lat || !lng) {
      next(new AppError("Please provide in a format lat,lng", 400));
    }

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: { data: tours },
    });
  }
);

export const getDistances = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(",");

    if (!lat || !lng) {
      next(new AppError("Please provide in a format lat,lng", 400));
    }

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          distanceField: "distance",
          distanceMultiplier: unit === "mi" ? 0.000621371 : 0.001,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      results: distances.length,
      data: { data: distances },
    });
  }
);

export const getTours = factory.getAll(Tour);
export const getTour = factory.getOne(Tour, { path: "reviews" });
export const createTour = factory.createOne(Tour);
export const updateTour = factory.updateOne(Tour);
export const deleteTour = factory.deleteOne(Tour);
