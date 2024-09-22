import { promisify } from "util";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";
import User, { IUser } from "../models/user";
import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";
import { Document } from "mongoose";
import { IRequestWithUser } from "../types/types";

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
      role: req.body.role,
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

export const protect = catchAsync(
  async (
    req: IRequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    let token: string | undefined;
    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith("Bearer")) {
      token = authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError(
          "You are not logged in. Please log in to gain access.",
          401
        )
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }
    if (await user.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "The user recently changed password. Please log in again",
          401
        )
      );
    }

    req.user = user;
    next();
  }
);

export const restrictTo =
  (...roles) =>
  (req: IRequestWithUser, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
