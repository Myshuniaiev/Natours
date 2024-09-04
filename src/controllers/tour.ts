import { Request, Response } from "express";
import Tour, { ITour } from "../models/tour";

// Extend the Request interface with ITour for the body
interface RequestWithBody<T> extends Request {
  body: T;
}

// Handler to get all tours
export const getTours = async (req: Request, res: Response): Promise<void> => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    if (req.query.fields) {
      const fields = (req.query.fields as string).split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    const tours = await query;

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
    const { params } = req;
    const tour = await Tour.findById(params.id);
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

// Handler to update a tour (not yet defined)
export const updateTour = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { params, body } = req;
    const tour = await Tour.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: "success", data: { tour } });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};

// Handler to delete a tour (not yet defined)
export const deleteTour = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { params } = req;
    await Tour.findByIdAndDelete(params.id);
    res.status(200).json({ status: "success" });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }
};
