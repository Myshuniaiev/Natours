import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import { CookieOptions, NextFunction, Request, Response } from "express";

import User from "@models/user";
import { IUser } from "@mytypes/user";
import AppError from "@utils/appError";
import catchAsync from "@utils/catchAsync";
import sendEmail from "@utils/email";

const createAndSendToken = (user: IUser, statusCode: number, res: Response) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiration = process.env.JWT_EXPIRATION_TIME ?? "1d";
  const cookieExpiration = process.env.JWT_COOKIE_EXPIRATION_TIME
    ? parseInt(process.env.JWT_COOKIE_EXPIRATION_TIME)
    : 90;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not defined.");
  }

  const token = jwt.sign({ id: user._id }, jwtSecret, {
    expiresIn: jwtExpiration,
  });

  const cookieOptions: CookieOptions = {
    expires: new Date(Date.now() + cookieExpiration * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    data: { data: user },
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
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
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const jwtSecret = process.env.JWT_SECRET;
    let token: string | undefined;
    const authorization = req.headers.authorization;
    if (authorization && authorization.startsWith("Bearer")) {
      token = authorization.split(" ")[1];
    }

    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is not defined.");
    }

    if (!token) {
      return next(
        new AppError(
          "You are not logged in. Please log in to gain access.",
          401
        )
      );
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (typeof decoded === "string" || !("id" in decoded)) {
      return next(new AppError("Token is invalid", 401));
    }

    const user = await User.findById((decoded as jwt.JwtPayload).id);

    if (!user) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }
    if (
      await user.changedPasswordAfter(
        (decoded as jwt.JwtPayload & { iat: string }).iat
      )
    ) {
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
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };

export const forgotPassword = async (
  req: Request,
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Token is invalid or expired.", 400));
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (await User.findById(req.user.id).select(
      "+password"
    )) as IUser;

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
