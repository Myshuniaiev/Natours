import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import APIFeatures from "../utils/apiFeatures";
import User, { IUser } from "../models/user";

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

export const getUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const features = new APIFeatures<IUser>(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const users = await features.query;

    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    });
  }
);

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
