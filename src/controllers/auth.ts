import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/user";
import catchAsync from "../utils/catchAsync";

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await User.create(req.body);

    res.status(201).json({
      status: "success",
      data: { user },
    });
  }
);
