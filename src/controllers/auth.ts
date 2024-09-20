import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";
import User, { IUser } from "../models/user";
import { NextFunction, Request, Response } from "express";

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });

    res.status(201).json({
      status: "success",
      token,
      data: { user },
    });
  }
);
