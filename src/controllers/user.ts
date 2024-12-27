import { Response, NextFunction, Request } from "express";
import multer from "multer";
import User from "@models/user";
import AppError from "@utils/appError";
import catchAsync from "@utils/catchAsync";
import { filterObj } from "@utils/filterObj";
import { uploadResizedImage, deleteS3Object } from "@utils/s3Utils";
import * as factory from "@controllers/handlerFactory";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadUserPhoto = upload.single("photo");

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          "This route is not for password updates. Please use /updatePassword.",
          400
        )
      );
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return next(new AppError("No user found with that ID", 404));
    }

    const oldPhotoName = currentUser.photoName || "";
    let newPhotoName: string | undefined;
    let newPhotoUrl: string | undefined;

    if (req.file) {
      if (oldPhotoName) {
        await deleteS3Object(oldPhotoName);
      }
      const { photoName, photoUrl } = await uploadResizedImage(
        req.file,
        req.user.id
      );
      newPhotoName = photoName;
      newPhotoUrl = photoUrl;
    } else {
      if (!req.body.photoName && oldPhotoName) {
        await deleteS3Object(oldPhotoName);
        newPhotoName = undefined;
        newPhotoUrl = undefined;
      }
    }

    const filteredBody = filterObj(
      {
        ...req.body,
        ...(typeof newPhotoName !== "undefined" && { photoName: newPhotoName }),
        ...(typeof newPhotoUrl !== "undefined" && { photoUrl: newPhotoUrl }),
      },
      "name",
      "email",
      "photoName",
      "photoUrl"
    );

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

    res.status(200).json({
      status: "success",
      data: { data: updatedUser },
    });
  }
);

export const deleteMe = catchAsync(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: "success", data: null });
});

export const getMe = (req: Request, _res: Response, next: NextFunction) => {
  req.params.id = req.user.id;
  next();
};

export const getUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const createUser = factory.createOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
