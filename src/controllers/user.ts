import { Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import APIFeatures from "../utils/apiFeatures";
import User, { IUser } from "../models/user";
import { IRequest } from "../types/types";

interface Tour {
  _id: string;
  // add other properties of a tour if needed
}

const tours: Tour[] = []; // This should be populated with tour data

export const checkId = (
  req: IRequest,
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
  async (req: IRequest, res: Response, next: NextFunction): Promise<void> => {
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

export const getUser = (req: IRequest, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};

export const createUser = (req: IRequest, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};

export const updateUser = (req: IRequest, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};

export const deleteUser = (req: IRequest, res: Response): void => {
  res
    .status(500)
    .json({ status: "error", message: "This route is not yet defined." });
};
