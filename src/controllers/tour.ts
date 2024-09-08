import { NextFunction, Request, Response } from "express";
import Tour, { ITour } from "../models/tour";
import APIFeatures from "../utils/apiFeatures";

// Extend the Request interface with ITour for the body and query string
interface RequestWithBody<T> extends Request {
  body: T;
}

// Handler to get top tours
export const aliasTopTours = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  req.query.limit = "5";
  req.query.sort = "-ratingAverage,price";
  req.query.fields = "name,price,ratingAverage,summary,difficulty";
  next();
};

// Handler to get all tours
export const getTours = async (req: Request, res: Response): Promise<void> => {
  try {
    const features = new APIFeatures<ITour>(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res
      .status(200)
      .json({ status: "success", results: tours.length, data: { tours } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

// Handler to get a specific tour by ID
export const getTour = async (req: Request, res: Response): Promise<void> => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({ status: "success", data: { tour } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

// Handler to create a new tour
export const createTour = async (
  req: RequestWithBody<ITour>,
  res: Response
): Promise<void> => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: "success", data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

// Handler to update a tour
export const updateTour = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: "success", data: { tour } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

// Handler to delete a tour
export const deleteTour = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "success" });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

export const getTourStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

export const getMonthlyPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
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
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};
