import { Request, Response, NextFunction } from "express";
import Tour, { ITour } from "../models/tour";

// Extend the Request interface with ITour for the body
interface RequestWithBody<T> extends Request {
  body: T;
}

// Handler to get all tours
export const getTours = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};

// Handler to get a specific tour by ID
export const getTour = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
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
export const updateTour = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};

// Handler to delete a tour (not yet defined)
export const deleteTour = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};
