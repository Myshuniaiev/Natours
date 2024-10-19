import { Response, NextFunction, Request } from "express";

import User from "@models/user";
import { IUser } from "src/mytypes/user";
import APIFeatures from "@utils/apiFeatures";
import AppError from "@utils/appError";
import catchAsync from "@utils/catchAsync";
import * as factory from "@controllers/handlerFactory";

const filterObj = <T extends object>(
  obj: T,
  ...allowedFields: (keyof T)[]
): Partial<T> => {
  const newObj: Partial<T> = {};

  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key as keyof T)) {
      newObj[key as keyof T] = obj[key as keyof T];
    }
  });

  return newObj;
};

export const getUsers = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
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

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "This route is not for password updates. Please use /updatePassword route.",
          400
        )
      );
    }

    const filteredBody = filterObj(req.body, "name", "email");
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: { user },
    });
  }
);

export const deleteMe = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const updateUser = factory.updateOne(User);

export const deleteUser = factory.deleteOne(User);
