import crypto from "crypto";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { Document } from "mongoose";
import { NextFunction, Request, Response } from "express";

import User, { IUser } from "../models/user";

import sendEmail from "../utils/email";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";

import { IRequestWithUser } from "../types/types";

const createAndSendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
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

    createAndSendToken(user, 201, res);
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

    createAndSendToken(user, 200, res);
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

export const forgotPassword = async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with this email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      resetURL,
    });

    res
      .status(200)
      .json({ status: "success", message: "Token sent to email." });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later.",
        500
      )
    );
  }
};

export const resetPassword = catchAsync(
  async (
    req: IRequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Token is invalid or expired˝.", 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createAndSendToken(user, 201, res);
  }
);

export const updatePassword = catchAsync(
  async (
    req: IRequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user = (await User.findById(req.user.id).select(
      "+password"
    )) as Document<unknown, {}, IUser> & IUser;

    const isPasswordCorrect = await user.correctPassword(
      req.body.currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return next(new AppError("Your current password is wrong.", 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createAndSendToken(user, 201, res);
  }
);
