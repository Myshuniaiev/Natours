import { NextFunction, Request, Response } from "express";
import APIFeatures from "@utils/apiFeatures";
import catchAsync from "@utils/catchAsync";
import Tour from "@models/tour";
import { ITour } from "@mytypes/tour";
import * as factory from "@controllers/handlerFactory";

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

export const getTours = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
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

export const getTour = factory.getOne(Tour, { path: "reviews" });

export const createTour = factory.createOne(Tour);

export const updateTour = factory.updateOne(Tour);

export const deleteTour = factory.deleteOne(Tour);

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
