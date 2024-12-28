import { Response, NextFunction, Request } from "express";
import multer from "multer";
import User from "@models/user";
import AppError from "@utils/appError";
import catchAsync from "@utils/catchAsync";
import { filterObj } from "@utils/filterObj";
import {
  uploadResizedImage,
  deleteS3Object,
  getPhotoUrl,
} from "@utils/s3Utils";
import * as factory from "@controllers/handlerFactory";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadUserPhoto = upload.single("photo");

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Disallow password updates
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "This route is not for password updates. Please use /updatePassword.",
          400
        )
      );
    }

    // Retrieve current user
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return next(new AppError("No user found with that ID", 404));
    }

    const { photo: oldPhotoKey } = currentUser;
    let newPhotoKey: string | undefined = undefined;
    let newPhotoUrl: string | undefined = undefined;

    try {
      // Handle photo upload or removal
      if (req.file) {
        if (oldPhotoKey) await deleteS3Object(oldPhotoKey);
        const { photo } = await uploadResizedImage(req.file, req.user.id);
        newPhotoKey = photo;
        newPhotoUrl = await getPhotoUrl(photo);
      } else if (!req.body.photo && oldPhotoKey) {
        await deleteS3Object(oldPhotoKey);
      }

      // Filter body fields to allow updates to name, email, and photo
      const filteredBody = filterObj(
        {
          ...req.body,
          ...(newPhotoKey && { photo: newPhotoKey }),
        },
        "name",
        "email",
        "photo"
      );

      // Update user document
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        return next(new AppError("No user found with that ID", 404));
      }

      // Construct response with new photo URL if applicable
      res.status(200).json({
        status: "success",
        data: {
          data: {
            ...updatedUser.toObject(),
            ...(updatedUser.photo && newPhotoUrl && { photo: newPhotoUrl }),
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

export const deleteMe = catchAsync(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: "success", data: null });
});

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError("No user found with that ID", 404));
    }

    // Transform the photo field with the URL
    const userObject = user.toObject();
    if (userObject.photo) {
      userObject.photo = await getPhotoUrl(userObject.photo);
    }

    res.status(200).json({
      status: "success",
      data: {
        data: userObject,
      },
    });
  }
);

export const getUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const createUser = factory.createOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
