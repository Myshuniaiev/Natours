import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";
import User, { IUser } from "../models/user";
import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import { Document } from "mongoose";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(user._id);
    res.status(201).json({
      status: "success",
      token,
      data: { user },
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new AppError("Both email and password are required fields", 400)
      );
    }

    const user = (await User.findOne({ email }).select(
      "+password"
    )) as Document<unknown, {}, IUser> & IUser;

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    const token = signToken(user._id);
    res.status(200).json({ status: "success", token });
  }
);
