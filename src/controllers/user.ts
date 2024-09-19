import { Request, Response, NextFunction } from "express";

interface Tour {
  _id: string;
  // add other properties of a tour if needed
}

const tours: Tour[] = []; // This should be populated with tour data

export const checkId = (
  req: Request,
  res: Response,
  next: NextFunction,
  value: string
): void => {
  const isExist = tours.find((tour) => tour._id === value);
  if (!isExist) {
    res.status(404).json({
      status: "fail",
      message: "Invalid ID.",
    });
    return;
  }
  next();
};

export const getUsers = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};

export const getUser = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};

export const createUser = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};

export const updateUser = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};

export const deleteUser = (req: Request, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};
