import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { Request, Response, NextFunction } from "express";

// Define an interface for the Tour objects
interface Tour {
  _id: string;
  name?: string;
  price?: number;
  // Add any other properties that may be needed
}

// Load tours data from a JSON file
const tours: Tour[] = [];

// Middleware to check if a tour ID exists
export const checkId = (
  req: Request,
  res: Response,
  next: NextFunction,
  value: string
): void => {
  const isExist = tours.find((i) => i._id === value);
  if (!isExist) {
    res.status(404).json({
      status: "fail",
      message: "Invalid ID.",
    });
    return;
  }
  next();
};

// Middleware to validate the request body
export const checkBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.body.name || !req.body.price) {
    res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
    return;
  }
  next();
};

// Handler to get all tours
export const getTours = (req: Request, res: Response): void => {
  res
    .status(200)
    .json({ status: "success", results: tours.length, data: { tours } });
};

// Handler to get a specific tour by ID
export const getTour = (req: Request, res: Response): void => {
  const tour = tours.find((i) => i._id === req.params.id);
  res.status(200).json({ status: "success", data: { tour } });
};

// Handler to create a new tour
export const createTour = (req: Request, res: Response): void => {
  const newTour = Object.assign({ _id: uuidv4() }, req.body);
  tours.push(newTour);
  //   fs.writeFile(
  //     `${__dirname}/../../dev-data/data/tours.json`,
  //     JSON.stringify(tours),
  //     (err) => {
  //       if (err) {
  //         res
  //           .status(500)
  //           .json({ status: "error", message: "Failed to save tour data." });
  //         return;
  //       }
  //       res.status(201).json({ status: "success", data: { tour: newTour } });
  //     }
  //   );
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
