import { Response, NextFunction, Request } from "express";

import User from "@models/user";
import AppError from "@utils/appError";
import catchAsync from "@utils/catchAsync";
import * as factory from "@controllers/handlerFactory";
import { filterObj } from "@utils/filterObj";

export const getMe = (req: Request, _res: Response, next: NextFunction) => {
  req.params.id = req.user.id;
  next();
};

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

export const getUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const createUser = factory.createOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
